import type {FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest} from 'fastify'

import S from 'fluent-json-schema'
import status_code from 'http-status-codes'

// FIXME: correct path after unjs/jiti#37
import {toType} from '../../utils'
import {key_token_verify} from '../redis'
import {id_gen_code} from './utils'

export async function sendMail(app: FastifyInstance, req:FastifyRequest, res: FastifyReply, mail: string, TTL: number) {
	const code = id_gen_code()
	const token_verify = key_token_verify(req.session.id)
	const ret = await app.redis.set(token_verify, code, 'ex', TTL)
	if (ret !== 'OK') {
		res.code(status_code.SERVICE_UNAVAILABLE).send('can not generate verification code, retry later')
		return res.sent
	}

	try {
		const info = await app.nodemailer.sendMail({
			from: 'iolabot@163.com',
			to: mail,
			subject: 'iolab 验证码',
			text: `你好, 本次验证码为${code}, ${TTL}秒后过期.`
		})
		app.log.info({info}, 'sent mail')
	} catch (error) {
		app.redis.del(token_verify) // free resources eagerly
		app.log.error({mail, error}, 'can not send mail')
		res.code(status_code.SERVICE_UNAVAILABLE).send('can not send email, retry later')
		return res.sent
	}

	return res.sent
}

interface Config {
	TTL: number
}

const routes: FastifyPluginCallback<Config> = async function (app, options) {
	app.get('/mail', {
		schema: {
			querystring: S.object()
				.prop('mail', S.string().format(S.FORMATS.EMAIL).required()),
		},
	}, async function (req, res) {
		const query = toType(req.query, 'object')

		if (await sendMail(app, req, res, query.mail as string, options.TTL))
			return

		res.send('sent')
	})
}

export default routes
