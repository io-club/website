import type {JTDDataType} from '~/alias/jtd'
import type {User} from '~/api/entity/user'
import type {FastifyPluginCallback} from 'fastify'

import {createHash} from 'crypto'
import fp from 'fastify-plugin'
import status_code from 'http-status-codes'
import {customAlphabet, nanoid} from 'nanoid'

import {userDefinition} from '~/api/entity/user'
import {toFastifySchema} from '~/api/utils/schema'

export interface Config {
	prefix: string
	url_api: string
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
					passwd: {
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
					passwd: req.body.passwd,
					email: req.body.email,
				})
				res.send('OK')
			},
		})

		// login
		const code_verifier = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 43)
		app.route<{ Body: JTDDataType<typeof signup_schema.body> }>({
			method: 'POST',
			url: '/login_begin',
			schema: {
				body: signup_schema.body,
			},
			handler: async function (req, res) {
				const verifier = code_verifier()
				const state = nanoid()
				// FIXME: hard-linked endpoint
				const auth = new URL('/oauth/authorize', options.url_api)
				auth.searchParams.set('response_type', 'code')
				auth.searchParams.set('client_id', this.root.id)
				auth.searchParams.set('redirect_uri', new URL('/user/login2', options.url_api).toString())
				auth.searchParams.set('code_challenge', createHash('sha256').update(verifier).digest('hex'))
				auth.searchParams.set('code_challenge_method', 'S256')
				auth.searchParams.set('state', state)
				req.session.set('state', state)
				req.session.set('verifier', verifier)
			},
		})

		app.route<{ Body: JTDDataType<typeof signup_schema.body> }>({
			method: 'POST',
			url: '/login_auth',
			schema: {
				body: signup_schema.body,
			},
			handler: async function (req, res) {
			},
		})

		app.route<{ Body: JTDDataType<typeof signup_schema.body> }>({
			method: 'POST',
			url: '/login_auth_2fa',
			schema: {
				body: signup_schema.body,
			},
			handler: async function (req, res) {
			},
		})

		app.route<{ Body: JTDDataType<typeof signup_schema.body> }>({
			method: 'POST',
			url: '/login_complete',
			schema: {
				body: signup_schema.body,
			},
			handler: async function (req, res) {
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
			response: {type: 'string'},
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
						id: {type: 'string'},
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
				Params: {id: User['id']},
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
						op: {enum: ['create', 'modify']},
					}
				},
				body: userDefinition,
			} as const
			app.route<{
				Params: {op: 'create' | 'modify'},
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
						id: {type: 'string'},
					},
				},
				response: userDefinition,
			} as const
			app.route<{
				Params: {id: User['id']},
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
						id: {type: 'string'},
					},
				},
				response: {type: 'string'},
			} as const
			app.route<{
				Params: {id: User['id']},
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
