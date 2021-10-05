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

	// raw json string
	fastify.removeContentTypeParser(['application/json'])
	fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (_, body, done) {
		done(null, body)
	})

	// parse and validate
	fastify.setValidatorCompiler(({ schema }) => {
		const parser = ajv.compileParser(schema)
		return (data) => {
			const value = parser(data)
			return {value, error: value ? undefined : new Error(`${parser.message} at ${parser.position}`)} 
		}
	})

	// serialize
	fastify.setSerializerCompiler(({ schema }) => {
		return ajv.compileSerializer(schema)
	})
}, {
	name: 'ajv'
})

export default plugin
