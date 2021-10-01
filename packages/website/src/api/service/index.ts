import type {FastifyPluginCallback} from 'fastify'

import image from './image'

export interface Config {
}

const routes: FastifyPluginCallback<Config> = async function (app, options) {
	app.register(image)
}

export default routes
