import type {AuthCode} from '~/api/entity/auth_code'
import type {FastifyPluginCallback} from 'fastify'

import fp from 'fastify-plugin'

export interface Config {
	TTL: number
	mail_from: string
}

export interface CheckOptions {
	id: string
	code: string
}

export interface IssueOptions {
	id: string
	ttl?: number
}

interface Code extends AuthCode {
	ttl: number
}

export interface Auth {
	check: (opt: CheckOptions) => Promise<boolean>
	issue: (opt: IssueOptions) => Promise<Code>
}

export const auth: FastifyPluginCallback<Config> = fp(async function (app, options) {
	const auth: Auth = {
		async check (opt) {
			const c = await app.entity.auth_code.consume(opt.id)
			return c?.code === opt.code
		},
		async issue (opt) {
			const id = opt.id
			const ttl = opt.ttl ?? options.TTL

			const code = await app.entity.auth_code.issue(id, ttl)

			return {
				...code,
				ttl,
			}
		},
	}
	app.decorate('auth', auth)
}, {
	name: 'auth',
	dependencies: ['entity', 'mailer'],
})
