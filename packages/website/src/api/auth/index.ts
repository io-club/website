import type {FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest} from 'fastify'

import status_code from 'http-status-codes'

// FIXME: correct path after unjs/jiti#37
import {key_token_verify} from '../redis'
import mail from './mail'

// It is an one-for-all checker for 2fa providers acting as the following:
// 1. set `id_token_verify(session.id)` to some code on redis
// 2. send code back to users somehow
export async function mfaCheck(app: FastifyInstance, req:FastifyRequest, res: FastifyReply, code: unknown) {
	const token_verify = key_token_verify(req.session.id)
	const result = await app.redis.getdel(token_verify)
	if (result !== 'OK') {
		res.code(status_code.SERVICE_UNAVAILABLE).send('can not verify code, retry later')
		return res.sent
	}
	if (result !== code) {
		app.log.debug({result, code, token_verify}, 'v1')
		res.code(status_code.FORBIDDEN).send('invalid code')
		return res.sent
	}
	return res.sent
}

export interface Config {
	mailTTL: number
}

const routes: FastifyPluginCallback<Config> = async function (app, options) {
	app.register(mail, {TTL: options.mailTTL})
}

export default routes
