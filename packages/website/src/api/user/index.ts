import type { JTDDataType } from '~/alias/jtd'
import type { User, verifyFactor } from '~/api/entity/user'
import type { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'

import fp from 'fastify-plugin'
import status_code from 'http-status-codes'

import { userDefinition } from '~/api/entity/user'
import { toFastifySchema } from '~/api/utils/schema'

export interface LoginData {
	id: string
	method: User['login_method']
	phase: number
}

export interface Config {
	prefix: string
	url_api: string
	mail_from: string
}

export const user: FastifyPluginCallback<Config> = fp(async function (app, options) {
	app.register(async function (app) {
		// signup
		const signup_schema = {
			body: {
				properties: {
					username: {
						type: 'string',
					},
					password: {
						type: 'string',
					},
					email: {
						type: 'string',
					},
				}
			},
		} as const
		app.route<{ Body: JTDDataType<typeof signup_schema.body> }>({
			method: 'POST',
			url: '/signup',
			schema: {
				body: signup_schema.body,
			},
			handler: async function (req, res) {
				await this.entity.user.signup({
					id: req.body.username,
					password: req.body.password,
					email: req.body.email,
				})
				res.send('OK')
			},
		})

		// login
		app.register(async function (app) {
			const begin_schema = {
				body: {
					discriminator: 'type',
					mapping: {
						'password': {
							properties: {
								username: { type: 'string' },
							},
						},
						'email': {
							properties: {
								email: {
									type: 'string',
									metadata: { format: 'email' },
								},
							},
						},
					},
				},
			} as const
			app.route<{ Body: JTDDataType<typeof begin_schema.body> }>({
				method: 'POST',
				url: '/',
				schema: {
					body: begin_schema.body,
				},
				handler: async function (req, res) {
					const state = req.session.get('state')
					if (state) {
						res.status(status_code.BAD_REQUEST).send('logout first to login')
						return
					}

					let user: User
					switch (req.body.type) {
					case 'password':
						try {
							user = await this.entity.user.getUserById(req.body.username)
						} catch (err) {
							this.log.error({err, body: req.body})
							res.status(status_code.BAD_REQUEST).send('can not find user')
							return
						}
						break
					case 'email':
						try {
							const users = await this.entity.user.getUserByField('email', req.body.email)
							if (users.length > 1) {
								res.status(status_code.BAD_REQUEST).send('more than one user')
								return
							}
							if (users.length < 1) {
								res.status(status_code.BAD_REQUEST).send('can not find user')
								return
							}
							user = users[0]
						} catch (err) {
							this.log.error({err, body: req.body})
							res.status(status_code.BAD_REQUEST).send('can not find user')
							return
						}
						break
					default:
						res.status(status_code.BAD_REQUEST).send('invalid login type')
						return
					}
					req.session.set('state', 'login')
					req.session.set('login', {
						id: user.id,
						method: user.login_method,
						phase: 0,
					})
					res.send(user.login_method[0])
				},
			})

			function preHandler(phase: verifyFactor | verifyFactor[]) {
				return function(req: FastifyRequest, res: FastifyReply) {
					const state = req.session.get('state')
					if (state !== 'login') {
						res.status(status_code.BAD_REQUEST).send('must begin a login process')
						return
					}

					const login = req.session.get('login')
					if (!login) {
						res.status(status_code.BAD_REQUEST).send('invalid login session')
						return
					}

					let pass
					if (phase instanceof Array) {
						pass = phase.includes(login.method[login.phase])
					} else {
						pass = login.method[login.phase] === phase
					}
					if (!pass) {
						res.status(status_code.BAD_REQUEST).send(`invalid login phase ${phase}, expect ${login.method[login.phase]}`)
						return
					}
				}
			}

			async function onSend(req: FastifyRequest, res: FastifyReply) {
				if (res.statusCode === status_code.OK) {
					const sess = req.session.get('login') as LoginData
					sess.phase += 1
					if (sess.phase === sess.method.length) {
						req.session.set('login', undefined)
						req.session.set('state', 'logged')
						return 'OK'
					} else {
						const method = sess.method[sess.phase]
						req.session.set('login', sess)
						return method
					}
				}
			}

			const password_schema = {
				body: {
					properties: {
						password: { type: 'string' },
					},
				},
			} as const
			app.route<{ Body: JTDDataType<typeof password_schema.body> }>({
				method: 'POST',
				url: '/password',
				schema: {
					body: password_schema.body,
				},
				preHandler: preHandler('password'),
				onSend,
				handler: async function (req, res) {
					const sess = req.session.get('login') as LoginData
					try {
						const user = await this.entity.user.getUserById(sess.id)
						if (user.password !== req.body.password) {
							res.status(status_code.BAD_REQUEST).send('incorrect password')
							return
						}
					} catch (err) {
						this.log.error({err, body: req.body})
						res.status(status_code.BAD_REQUEST).send('can not find user')
						return
					}
					res.send('OK')
				},
			})

			app.route({
				method: 'GET',
				url: '/email',
				preHandler: preHandler('email'),
				handler: async function (req, res) {
					const sess = req.session.get('login') as LoginData

					let user: User
					try {
						user = await this.entity.user.getUserById(sess.id)
					} catch (err) {
						this.log.error({err, body: req.body})
						res.status(status_code.BAD_REQUEST).send('can not find user')
						return
					}

					const mail = user.email.value

					let code
					try {
						code = await app.auth.issue({
							id: mail,
						})
					} catch (error) {
						this.log.error({mail, error}, 'can not issue new code')
						res.status(status_code.INTERNAL_SERVER_ERROR).send('can not issue new code')
						return
					}

					try {
						const info = await app.mailer.sendMail({
							from: options.mail_from,
							to: mail,
							subject: 'ioclub 验证码',
							text: `你好, 本次验证码为${code.code}, ${code.ttl}秒后过期.`
						})
						app.log.info({info}, 'sent mail')
					} catch (err) {
						this.log.error({err, body: req.body})
						res.status(status_code.BAD_REQUEST).send('can not send mail')
						return
					}
					res.send('OK')
				},
			})

			const mfa_schema = {
				body: {
					properties: {
						type: { enum: ['email', 'phone'] },
						code: { type: 'string' },
					},
				},
			} as const
			app.route<{ Body: JTDDataType<typeof mfa_schema.body> }>({
				method: 'POST',
				url: '/code',
				schema: {
					body: mfa_schema.body,
				},
				preHandler: preHandler(['email', 'phone']),
				onSend,
				handler: async function (req, res) {
					const sess = req.session.get('login') as LoginData

					let user: User
					try {
						user = await this.entity.user.getUserById(sess.id)
					} catch (err) {
						this.log.error({err, body: req.body})
						res.status(status_code.BAD_REQUEST).send('can not find user')
						return
					}

					let id: string
					switch (req.body.type) {
					case 'email':
						if (!user.email.verified) {
							res.status(status_code.BAD_REQUEST).send('email not exist, or verified')
							return
						}
						id = user.email.value
						break
					case 'phone':
						if (!user.phone || !user.phone.verified) {
							res.status(status_code.BAD_REQUEST).send('phone not exist, or verified')
							return
						}
						id = user.phone.value
						break
					}

					let check: boolean
					try {
						check = await app.auth.check({
							id,
							code: req.body.code,
						})
					} catch (error) {
						this.log.error({id, error}, 'can not check code')
						res.status(status_code.INTERNAL_SERVER_ERROR).send('can not check code')
						return
					}
					
					if (!check) {
						res.status(status_code.BAD_REQUEST).send('invalid code')
						return
					}

					res.send('OK')
				},
			})
		}, {
			prefix: '/login',
		})

		// logout
		const logout_schema = {
		} as const
		app.route({
			method: 'POST',
			url: '/logout',
			schema: {},
			handler: async function (req, res) {
				req.session.delete()
				res.send('OK')
			},
		})

		// self manipulation
		const current_get_schema = {
			response: userDefinition,
		} as const
		app.route({
			method: 'GET',
			url: '/',
			schema: toFastifySchema(current_get_schema),
			preHandler: app.handleAccessToken(true),
			handler: async function (req, res) {
				if (!req.access_token)
					return res.status(status_code.INTERNAL_SERVER_ERROR).send('can not get current token')
				const user = await this.entity.user.getUserById(req.access_token.userId)
				res.send(user)
			},
		})

		const current_patch_schema = {
			body: {
				optionalProperties: {
					email: { type: 'string' },
					phone: { type: 'string' },
				},
			},
			response: { type: 'string' },
		} as const
		app.route<{
			Body: JTDDataType<typeof current_patch_schema.body>,
		}>({
			method: 'PATCH',
			url: '/',
			schema: toFastifySchema(current_patch_schema),
			preHandler: app.handleAccessToken(true),
			handler: async function (req, res) {
				if (!req.access_token)
					return res.status(status_code.INTERNAL_SERVER_ERROR).send('can not get current token')
				await this.entity.user.patch({
					id: req.access_token.userId,
					email: req.body.email,
					phone: req.body.phone,
				})
				res.send('OK')
			},
		})

		// other users
		app.register(async function (app) {
			const get_schema = {
				params: {
					properties: {
						id: { type: 'string' },
					},
				},
				response: {
					optionalProperties: {
						email: { type: 'string' },
						phone: { type: 'string' },
					},
				},
			} as const
			app.route<{
				Params: { id: User['id'] },
			}>({
				method: 'GET',
				url: '/:id',
				schema: toFastifySchema(get_schema),
				preHandler: app.handleAccessToken(true),
				handler: async function (req, res) {
					if (!req.access_token)
						return res.status(status_code.INTERNAL_SERVER_ERROR).send('can not get current token')
					let user
					try {
						user = await this.entity.user.getUserById(req.access_token.userId)
					} catch (err) {
						return res.status(status_code.BAD_REQUEST).send('can not find such user')
					}
					const ret: JTDDataType<typeof get_schema.response> = {}
					if (user.email?.mode === 'public') {
						ret['email'] = user.email.value
					}
					if (user.phone?.mode === 'public') {
						ret['phone'] = user.phone.value
					}
					res.send(ret)
				},
			})
		},
		{
			prefix: 'users',
		})

		// agmin operation
		app.register(async function (app) {
			const update_schema = {
				params: {
					properties: {
						op: { enum: ['create', 'modify'] },
					}
				},
				body: userDefinition,
			} as const
			app.route<{
				Params: { op: 'create' | 'modify' },
				Body: User,
			}>({
				method: 'POST',
				url: '/:op',
				schema: toFastifySchema(update_schema),
				preHandler: app.handleAccessToken(false, 'user_write'),
				handler: async function (req, res) {
					if (!req.access_token)
						return res.status(status_code.INTERNAL_SERVER_ERROR).send('can not get current token')
					const ret = await this.entity.user.add(req.params.op, req.body)
					res.send(ret)
				},
			})

			const get_schema = {
				params: {
					properties: {
						id: { type: 'string' },
					},
				},
				response: userDefinition,
			} as const
			app.route<{
				Params: { id: User['id'] },
			}>({
				method: 'GET',
				url: '/:id',
				schema: toFastifySchema(get_schema),
				preHandler: app.handleAccessToken(false, 'user_read'),
				handler: async function (req, res) {
					if (!req.access_token)
						return res.status(status_code.INTERNAL_SERVER_ERROR).send('can not get current token')
					let user
					try {
						user = await this.entity.user.getUserById(req.access_token.userId)
					} catch (err) {
						return res.status(status_code.BAD_REQUEST).send('can not find such user')
					}
					res.send(user)
				},
			})

			const delete_schema = {
				params: {
					properties: {
						id: { type: 'string' },
					},
				},
				response: { type: 'string' },
			} as const
			app.route<{
				Params: { id: User['id'] },
			}>({
				method: 'DELETE',
				url: '/:id',
				schema: toFastifySchema(delete_schema),
				preHandler: app.handleAccessToken(false, 'user_write'),
				handler: async function (req, res) {
					if (!req.access_token)
						return res.status(status_code.INTERNAL_SERVER_ERROR).send('can not get current token')
					await this.entity.user.del(req.params.id)
					res.send('OK')
				},
			})
		},
		{
			prefix: '/admin',
		})
	},
	{
		prefix: options.prefix,
	})
})
