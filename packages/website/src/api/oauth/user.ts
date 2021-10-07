import type {JTDDataType} from '~/alias/jtd'
import type {FastifyPluginCallback} from 'fastify'

import {userDefinition} from './entity/user'

export interface Config {
}

export const routes: FastifyPluginCallback<Config> = async function (app) {
	const schemas = {
		get: {
			params: {
				properties: {
					id: { type: 'string' },
				},
			},
			response: {
				200: userDefinition,
			},
		},
		post: {
			body: userDefinition,
		},
		put: {
			params: {
				properties: {
					id: { type: 'string' },
				},
			},
			body: userDefinition,
		},
		delete: {
			params: {
				properties: {
					id: { type: 'string' },
				},
			},
		},
	} as const

	app.route<{
		Params: JTDDataType<typeof schemas.get.params>,
	}>({
		method: 'GET',
		url: '/:id',
		preHandler: async function(req) {
			const token = this.oauth.validateRequest(req)
			console.log(token)
		},
		schema: {
			params: schemas.get.params,
			response: schemas.get.response,
		},
		handler: async function(req) {
			return (await this.oauth.user.getWithPath('$', req.params.id))[0]
		},
	})

	app.route<{
		Body: JTDDataType<typeof schemas.post.body>,
	}>({
		method: 'POST',
		url: '/',
		schema: {
			body: schemas.post.body,
		},
		handler: async function(req) {
			await this.oauth.user.add('create', req.body)
			return 'OK'
		},
	})

	app.route<{
		Body: JTDDataType<typeof schemas.post.body>,
	}>({
		method: 'PUT',
		url: '/',
		schema: {
			body: schemas.put.body,
		},
		handler: async function(req) {
			await this.oauth.user.add('modify', req.body)
			return 'OK'
		},
	})

	app.route<{
		Params: JTDDataType<typeof schemas.get.params>,
	}>({
		method: 'DELETE',
		url: '/:id',
		schema: {
			params: schemas.get.params,
		},
		handler: async function(req) {
			await this.oauth.user.del(req.params.id)
			return 'OK'
		},
	})
}
