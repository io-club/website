import type {LoginData} from '~/api/user'
import type {FastifyPluginCallback} from 'fastify'
import type {CookieSerializeOptions} from 'fastify-cookie'
import type {JWK, KeyLike} from 'jose'

import fp from 'fastify-plugin'
import status_code from 'http-status-codes'
import {EncryptJWT, importJWK, jwtDecrypt} from 'jose'

export interface Config {
	cookieName: string
	keys: JWK[]
	cookieOptions?: CookieSerializeOptions
}


export interface SessionData extends Record<string, unknown> {
	state?: 'login' | 'register' | 'logged'
	login?: LoginData
	user?: import('~/api/entity/user').User
}

export class Session {
	#changed: boolean
	#deleted: boolean
	#default_options: CookieSerializeOptions
	#options?: CookieSerializeOptions
	#data: SessionData

	constructor(input: Record<string, unknown>, opts?: CookieSerializeOptions) {
		this.#data = input
		this.#changed = false
		this.#deleted = false
		this.#default_options = opts ?? {
			path: '/',
			httpOnly: true,
		}
	}

	get changed() {
		return this.#changed
	}

	get deleted() {
		return this.#deleted
	}

	delete() {
		this.#deleted = true
	}

	get<K extends keyof SessionData>(key: K) {
		return this.#data[key]
	}

	set<K extends keyof SessionData>(key: K, value: SessionData[K]) {
		this.#changed = true
		this.#data[key] = value
	}

	get data() {
		return this.#data
	}

	options(opts: CookieSerializeOptions) {
		this.#options = opts
	}

	get cookieOptions(): CookieSerializeOptions {
		return {
			...this.#default_options,
			...this.#options,
		}
	}
}

const plugin: FastifyPluginCallback<Config> = fp(async function (app, options) {
	const keys: KeyLike[] = []
	for (const k of options.keys) {
		keys.push(await importJWK(k, undefined, true) as KeyLike)
	}
	app.decorateRequest('session', null)
	app.addHook('onRequest', async function (req) {
		let session = {}

		const cookie = req.cookies[options.cookieName]
		if (cookie) {
			for (const key of keys) {
				if (key.type !== 'private') continue
				try {
					const res = await jwtDecrypt(cookie, key, {
					})
					session = res.payload
					break
				} catch (err) {
					this.log.debug({key}, 'can not decrypt jwt')
				}
			}
		}

		req.session = new Session(session, options.cookieOptions)
	})
	app.addHook('onSend', async function (req, res) {
		const session = req.session
		if (session.deleted) {
			res.clearCookie(options.cookieName, session.cookieOptions)
			return
		}
		if (session.changed) {
			let text: string | undefined
			const v = new EncryptJWT(session.data)
			for (const key of keys) {
				if (key.type !== 'public') continue
				try {
					text = await v
						.setProtectedHeader({
							alg: 'ECDH-ES+A256KW',
							enc: 'A256GCM',
						})
						.setIssuedAt()
						.encrypt(key)
					break
				} catch (err) {
					this.log.debug({key, err}, 'can not encrypt jwt')
				}
			}
			if (!text) {
				app.log.error({text, session}, 'can not set session')
				res.status(status_code.INTERNAL_SERVER_ERROR)
				return 'error'
			}
			res.setCookie(options.cookieName, text, session.cookieOptions)
			return
		}
	})
}, {
	fastify: '3.x',
	name: 'session',
	dependencies: ['fastify-cookie'],
})

export default plugin
