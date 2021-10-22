import type {JTDOptions} from '~/alias/jtd'
import type {FastifyPluginCallback} from 'fastify'

import fp from 'fastify-plugin'

import Ajv from '~/alias/jtd'

export interface Config extends JTDOptions {
}

const plugin: FastifyPluginCallback<Config> = fp(async function (fastify, options) {
	const ajv = new Ajv({
		...options,
		allowDate: true,
		parseDate: true,
	})

	// format
	ajv.addKeyword({
		keyword: 'format',
		type: 'string',
		schemaType: 'string',
		compile: (format) => {
			// from ajv-formats
			const formats: Record<string, RegExp> = {
				date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
				time: /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i,
				'date-time': /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i,
				// uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
				uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
				'uri-reference': /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
				// email (sources from jsen validator):
				// http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
				// http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
				email:
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
				phone: /^(\+[0-9]{2})?[0-9]+$/,
				alpha: /^[a-zA-Z]*$/,
				alnum: /^[a-zA-Z0-9]*$/,
				alnun: /^[a-zA-Z0-9_]*$/,
			}
			const validator = formats[format]
			if (!validator) {
				return (data) => {
					fastify.log.warn(`unknown format ${format} for ${data}`)
					return false
				}
			}
			return (data) => validator.test(data)
		},
	})

	fastify.decorate('ajv', ajv)

	// raw json string
	fastify.removeContentTypeParser(['application/json'])
	fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (_, body, done) {
		done(null, body)
	})

	// parse and validate
	fastify.setValidatorCompiler(({ schema, httpPart }) => {
		if (httpPart === 'body') {
			const parser = ajv.compileParser(schema)
			return (data) => {
				const value = parser(data)
				return {value, error: value ? undefined : new Error(`${parser.message} at ${parser.position}\n${new String(data).slice(
					parser.position <= 10 ? 0 : parser.position - 10,
					parser.position + 10,
				)}`)} 
			}
		} else {
			const validate = ajv.compile(schema)
			return (data) => {
				return {
					error: validate(data) ? undefined : new Error(JSON.stringify(validate.errors))
				}
			}
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
