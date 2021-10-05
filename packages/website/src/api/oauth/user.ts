import type {FastifyInstance, FastifyPluginCallback} from 'fastify'

export interface Config {
	prefix: string 
	jwtSecret: Secret
	accessTokenTTL: string
	root: OAuthClient
}

export const routes: FastifyPluginCallback<Config> = async function (app, options) {
	app.get('/:id', async function(req, res) {
	})
}
