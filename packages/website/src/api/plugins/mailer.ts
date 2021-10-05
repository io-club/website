import type {FastifyPluginCallback} from 'fastify'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

import fp from 'fastify-plugin'
import {createTransport} from 'nodemailer'

export interface Options extends SMTPTransport.Options {
}

const plugin: FastifyPluginCallback<Options> = fp(async function (fastify, options) {
	fastify.decorate('mailer', createTransport(options))
}, {
	name: 'mailer',
})

export default plugin
