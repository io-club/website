import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'

import dayjs from 'dayjs'
import status_code from 'http-status-codes'

// FIXME: correct path after unjs/jiti#37
import {key_user_sess} from '../redis'

// reference user
// uid: string
// login_method: 'pass' | 'mail'
// nick: string
// mail: string
// pass: string

export async function validateSession(app: FastifyInstance, req:FastifyRequest, res: FastifyReply) {
	const uid = req.session.get('uid')
	req.session.set('uid', undefined)
	if (!uid) {
		res.code(status_code.FORBIDDEN).send('invalid session, please login first')
		return res.sent
	}

	const sid = key_user_sess(uid)
	const ret = await app.redis.pipeline()
		.watch(sid)
		.multi()
		.zremrangebyscore(sid, '-inf', dayjs().valueOf())
		.zscore(sid, req.session.id)
		.exec((err, ret) => {
			if (err) {
				app.log.warn({err, ret, uid}, 'v1')
				return res.code(status_code.SERVICE_UNAVAILABLE).send('can not validate the session, retry later')
			}
		})
	if (res.sent)
		return res.sent

	if (!ret[3][1]) {
		res.code(status_code.FORBIDDEN).send('session is revoked')
		return res.sent
	}

	return res.sent
}
