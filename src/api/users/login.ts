// FIXME: correct path after unjs/jiti#37
import type {Config as authConfig} from '../auth'
import type {FastifyPluginCallback} from 'fastify'

import dayjs from 'dayjs'
import S from 'fluent-json-schema'
import status_code from 'http-status-codes'

// FIXME: correct path after unjs/jiti#37
import {toType} from '../../utils'
import {mfaCheck} from '../auth'
import {sendMail} from '../auth/mail'
import {key_user_index, key_user_sess} from '../redis'

export interface Config {
	sessionTTL: number
	auth: authConfig
}

const routes: FastifyPluginCallback<Config> = async function (app, options) {
	app.get('/login', {
		schema: {
			querystring: S.object()
				.oneOf([
					S.required(['mail']),
					S.required(['nick']),
				])
				.required(['pass'])
				.prop('mail', S.string().format(S.FORMATS.EMAIL))
				.prop('nick', S.string().minLength(3).maxLength(32))
				.prop('pass', S.string().minLength(6).maxLength(32))
		},
	}, async function (req, res) {
		const query = toType(req.query, 'object')

		const indices: string[] = []
		for (const [k,v] of Object.entries(query)) {
			switch (k) {
			case 'mail':
			case 'nick':
				indices.push(key_user_index(k, v as string))
				break
			}
		}

		const userid = (await this.redis.mget(...indices)).find(e => !!e) as string
		const info = await this.redis.hgetall(userid)
		if (info.login_method === 'pass') {
			if (info.pass !== query.pass) {
				return res.code(status_code.FORBIDDEN).send('incorrect password')
			}
			if (await this.redis.zadd(key_user_sess(info.uid), dayjs().add(options.sessionTTL, 's').valueOf(), req.session.id) !== 1) {
				return res.code(status_code.SERVICE_UNAVAILABLE).send('can not login, retry later')
			}
			req.session.set('uid', info.uid)
			return res.send('succesful')
		}

		// if mfa enabled, needs to do mfa
		const factor = info[info.login_method]
		if (!factor) {
			return res.code(status_code.FORBIDDEN).send(`user does not support login method ${info.login_method}`)
		}

		switch (info.login_method) {
		case 'mail':
			if (await sendMail(app, req, res, factor, options.auth.mailTTL)) return
			break
		default:
			return res.code(status_code.FORBIDDEN).send(`unsupported login method ${info.login_method}`)
		}

		req.session.set('uid', info.uid)
		return res.send('needs mfa')
	})

	app.get('/login_mfa', {
		schema: {
			querystring: S.object()
				.required(['code'])
				.prop('code', S.string()),
		},
	}, async function(req, res) {
		const uid = req.session.get('uid')
		req.session.set('uid', undefined)
		if (!uid)
			return res.code(status_code.FORBIDDEN).send('invalid session, please login first')

		if (await mfaCheck(this, req, res, ''))
			return

		if (await this.redis.zadd(key_user_sess(uid), dayjs().add(options.sessionTTL, 's').valueOf(), req.session.id) !== 1) {
			return res.code(status_code.SERVICE_UNAVAILABLE).send('can not login, retry later')
		}

		req.session.set('uid', uid)
		return res.send('succesful')
	})
}

export default routes
