import type { JTDDataType } from '~/alias/jtd'
import type { User } from '~/api/entity/user'
import type { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'

import fp from 'fastify-plugin'
import status_code from 'http-status-codes'

import { userDefinition } from '~/api/entity/user'
import { toFastifySchema } from '~/api/utils/schema'

export interface LoginData {
	id: string
	state: 'password' | 'mfa'
	mfa: User['mfa']
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
						res.status(status_code.BAD_REQUEST).send({
							error: 'logout first to login',
						})
						return
					}

					let user: User
					switch (req.body.type) {
					case 'password':
						try {
							user = await this.entity.user.getUserById(req.body.username)
						} catch (err) {
							this.log.error({err, body: req.body})
							res.status(status_code.BAD_REQUEST).send({
								error: 'can not find user',
							})
							return
						}
						break
					case 'email':
						try {
							const users = await this.entity.user.getUserByField('email', req.body.email)
							if (users.length > 1) {
								res.status(status_code.BAD_REQUEST).send({
									error: 'more than one user',
								})
								return
							}
							if (users.length < 1) {
								res.status(status_code.BAD_REQUEST).send({
									error: 'can not find user',
								})
								return
							}
							user = users[0]
						} catch (err) {
							this.log.error({err, body: req.body})
							res.status(status_code.BAD_REQUEST).send({
								error: 'can not find user',
							})
							return
						}
						break
					default:
						res.status(status_code.BAD_REQUEST).send({
							error: 'invalid login type',
						})
						return
					}
					req.session.set('state', 'login')
					req.session.set('login', {
						id: user.id,
						mfa: user.mfa,
						state: 'password',
					})
					res.send({})
				},
			})

			function preHandler(mfa: boolean, method?: string) {
				return async function(req: FastifyRequest, res: FastifyReply) {
					const state = req.session.get('state')
					if (state !== 'login') {
						res.status(status_code.BAD_REQUEST).send({
							error: 'must begin a login process',
						})
						return
					}

					const login = req.session.get('login')
					if (!login) {
						res.status(status_code.BAD_REQUEST).send({
							error: 'invalid login session',
						})
						return
					}

					if (mfa) {
						if (login.mfa.login === 'skip_password') {
							login.state = 'mfa'
							req.session.set('login', login)
						}

						if (login.state !== 'mfa') {
							res.status(status_code.BAD_REQUEST).send({
								error: 'please verify password first',
							})
							return
						}

						if (method && !login.mfa.verified[method]) {
							res.status(status_code.BAD_REQUEST).send({
								error: `${mfa} not verified`,
							})
							return
						}
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
				preHandler: preHandler(false),
				handler: async function (req, res) {
					const sess = req.session.get('login') as LoginData

					try {
						const user = await this.entity.user.getUserById(sess.id)
						if (user.password !== req.body.password) {
							res.status(status_code.BAD_REQUEST).send({
								error: 'incorrect password',
							})
							return
						}
					} catch (err) {
						this.log.error({err, body: req.body})
						res.status(status_code.BAD_REQUEST).send({
							error: 'can not find user',
						})
						return
					}

					if (sess.mfa.login !== 'none') {
						sess.state = 'mfa'
						req.session.set('login', sess)
						res.send({
							prefer: sess.mfa.prefer,
							methods: Object.keys(sess.mfa.verified),
						})
						return
					}

					req.session.set('login', undefined)
					req.session.set('state', 'logged')
					res.send({
						data: true,
					})
				},
			})

			app.route({
				method: 'GET',
				url: '/email',
				preHandler: preHandler(true, 'email'),
				handler: async function (req, res) {
					const sess = req.session.get('login') as LoginData

					let user: User
					try {
						user = await this.entity.user.getUserById(sess.id)
					} catch (err) {
						this.log.error({err, body: req.body})
						res.status(status_code.BAD_REQUEST).send({
							error: 'can not find user',
						})
						return
					}

					const mail = user.email

					let code
					try {
						code = await app.auth.issue({
							id: mail,
						})
					} catch (error) {
						this.log.error({mail, error}, 'can not issue new code')
						res.status(status_code.INTERNAL_SERVER_ERROR).send({
							error: 'can not issue new code',
						})
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
						res.status(status_code.BAD_REQUEST).send({
							error: 'can not send mail',
						})
						return
					}

					res.send({})
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
				preHandler: preHandler(true),
				handler: async function (req, res) {
					const sess = req.session.get('login') as LoginData

					let user: User
					try {
						user = await this.entity.user.getUserById(sess.id)
					} catch (err) {
						this.log.error({err, body: req.body})
						res.status(status_code.BAD_REQUEST).send({
							error: 'can not find user',
						})
						return
					}

					const id = user[req.body.type]

					let check: boolean
					try {
						check = await app.auth.check({
							id,
							code: req.body.code,
						})
					} catch (error) {
						this.log.error({id, error: `${error}`}, 'can not check code')
						res.status(status_code.INTERNAL_SERVER_ERROR).send({
							error: 'can not check code',
						})
						return
					}

					if (!check) {
						res.status(status_code.BAD_REQUEST).send({
							error: 'invalid code',
						})
						return
					}

					req.session.set('login', undefined)
					req.session.set('state', 'logged')
					res.send({
						data: true,
					})
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
					ret['email'] = user.email
					ret['phone'] = user.phone
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
