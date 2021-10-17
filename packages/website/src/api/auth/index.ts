import type {FastifyPluginCallback} from 'fastify'

import fp from 'fastify-plugin'

export interface Config {
	TTL: number
	mail_from: string
}

interface BaseOptions {
	id: string
	sess: string
}

export interface CheckOptions extends BaseOptions {
	code: string
}

export interface MailOptions extends BaseOptions {
	to: string
	subject: string
	text: string
	ttl?: number
}

export interface Auth {
	check: (opt: CheckOptions) => Promise<boolean>
	send_mail: (opt: MailOptions) => Promise<void>
}

const routes: FastifyPluginCallback<Config> = fp(async function (app, options) {
	const auth: Auth = {
		async check (opt) {
			const c = await app.entity.auth_code.consume(opt.id)
			return c?.sess === opt.sess && c?.code === opt.code
		},
		async send_mail (opt) {
			const id = opt.id
			const sess = opt.sess
			const mail = opt.to
			const ttl = opt.ttl ?? options.TTL

			let code
			try {
				code = await app.entity.auth_code.issue(id, sess, ttl)
			} catch (error) {
				app.log.error({mail, error}, 'can not issue new code')
				throw new Error('can not issue new code')
			}

			try {
				const info = await app.mailer.sendMail({
					from: options.mail_from,
					to: mail,
					subject: 'ioclub 验证码',
					text: `你好, 本次验证码为${code}, ${ttl}秒后过期.`
				})
				app.log.info({info}, 'sent mail')
			} catch (error) {
				app.log.error({mail, error}, 'can not send mail')
				throw new Error('can not send new mail')
			}
		},
	}
	app.decorate('auth', auth)
}, {
	name: 'auth',
	dependencies: ['entity', 'mailer'],
})

export default routes
