import type {Config as imageConfig} from './image'
import type {FastifyPluginCallback} from 'fastify'

import image from './image'

export interface Config {
	image: imageConfig
}

const routes: FastifyPluginCallback<Config> = async function (app, options) {
	app.register(image, options.image)
}

export default routes
