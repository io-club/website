import type {FastifyPluginCallback} from 'fastify'

import S from 'fluent-json-schema'
import status_code from 'http-status-codes'
import {nanoid} from 'nanoid'

// FIXME: correct path after unjs/jiti#37
import {toType} from '../../utils'
import {mfaCheck} from '../auth'
import {key_user_index, key_user_meta} from '../redis'

const id_gen_user = nanoid

const routes: FastifyPluginCallback = async function (app) {
	app.get('/signup', {
		schema: {
			querystring: S.object()
				.anyOf([
					S.required(['mail', 'code']),
					S.required(['nick']),
				])
				.required(['pass'])
				.prop('mail', S.string().format(S.FORMATS.EMAIL))
				.prop('nick', S.string().minLength(3).maxLength(32))
				.prop('pass', S.string().minLength(6).maxLength(32))
				.prop('code', S.string().maxLength(64)),
		},
	}, async function (req, res) {
		const query = toType(req.query, 'object')

		if (!query.nick) {
			if (await mfaCheck(this, req, res, query.code)) return
		}

		const user: Record<string, string> = {
			uid: id_gen_user(),
			login_method: 'pass',
		}

		// fill up indices needed to watch
		const indices: string[] = [key_user_meta(user.uid as string)]
		for (const [k,v] of Object.entries(query)) {
			switch (k) {
			case 'pass':
				user[k] = v as string
				break
			case 'mail':
			case 'nick':
				// complete user info
				user[k] = v as string
				indices.push(key_user_index(k, v as string))
				break
			}
		}

		await this.redis.pipeline()
			.watch(...indices)
			.exists(indices[0])
			.exists(...indices.slice(1))
			.exec((err, ret) => {
				if (err || ret[0][1] > 0) {
					this.log.warn({indices, err, ret}, 'can not register user meta')
					return res.code(status_code.SERVICE_UNAVAILABLE).send('failed to register user, retry later')
				}
				if (ret[1][1] > 0) {
					return res.code(status_code.FORBIDDEN).send('user with same mail/nick exists')
				}
			})
		if (res.sent) {
			await this.redis.unwatch()
			return
		}

		const txn = this.redis.multi()
		for (const v of indices.slice(1)) {
			txn.set(v, indices[0])
		}
		txn.hset(indices[0], user)
		await txn.exec((err, ret) => {
			if (err) {
				this.log.warn({indices, err, ret}, 'v1')
				return res.code(status_code.SERVICE_UNAVAILABLE).send('failed to register user, retry later')
			}
		})
		if (res.sent) return

		res.send('succesful')
	})
}

export default routes
