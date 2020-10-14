// FIXME: correct path after unjs/jiti#37
import type {Config as authConfig} from '../auth'
import type {FastifyPluginCallback} from 'fastify'

import login from './login'
import signup from './signup'

export interface Config {
	sessionTTL: number
	auth: authConfig
}

const routes: FastifyPluginCallback<Config> = async function (app, options) {
	app.register(signup)
	app.register(login, options)
}

export default routes
