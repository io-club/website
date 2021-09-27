import type {FastifyPluginCallback} from 'fastify'

import {createTransport} from 'nodemailer'

export interface Options {
	transport: Parameters<typeof createTransport>[0],
	defaults?: Parameters<typeof createTransport>[1],
}

const plugin: FastifyPluginCallback<Options> = async function (fastify, options) {
	try {
		const {defaults, transport} = options

		if (!transport) {
			throw new Error('You must provide a valid transport configuration object, connection url or a transport plugin instance')
		}

		const transporter = createTransport(transport, defaults)
		if (fastify.mailer) {
			return new Error('fastify-mailer has already been registered')
		} else {
			fastify.decorate('mailer', transporter)
		}
	} catch (error) {
		return error
	}
}

export default plugin
