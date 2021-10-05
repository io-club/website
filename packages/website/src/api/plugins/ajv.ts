import type {JTDOptions} from '@/alias/jtd'
import type {FastifyPluginCallback} from 'fastify'

import fp from 'fastify-plugin'

import Ajv, {format, formatKeyword} from '@/alias/jtd'

export interface Config extends JTDOptions {
}

const plugin: FastifyPluginCallback<Config> = fp(async function (fastify, options) {
	const ajv = new Ajv({
		...options,
	})

	// format
	ajv.addKeyword(formatKeyword)
	format(ajv)

	fastify.decorate('ajv', ajv)
	// @ts-expect-error
	fastify.setValidatorCompiler(({ schema }) => {
		return ajv.compile(schema)
	})
}, {
	name: 'ajv'
})

export default plugin
