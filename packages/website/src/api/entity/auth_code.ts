import type {JTDSchemaType} from '~/alias/jtd'
import type {FastifyInstance} from 'fastify'

import {customAlphabet} from 'nanoid'
import {join} from 'pathe'

import {BaseRepository} from './base'

export interface AuthCode {
	id: string
	code: string
}

export const codeDefinition: JTDSchemaType<AuthCode> = {
	properties: {
		id: { type: 'string' },
		code: { type: 'string', metadata: { format: 'alnun' } },
	},
}

export class AuthCodeRepository extends BaseRepository<AuthCode> {
	#idgen: () => string

	constructor(app: FastifyInstance, prefix: string) {
		super({
			redis: app.redis,
			prefix: join(prefix, 'auth_code'),
			parser: app.ajv.compileParser(codeDefinition),
			serializer: app.ajv.compileSerializer(codeDefinition),
		})
		this.#idgen = customAlphabet('0123456789', 6)
	}

	async issue(id: string, expires: number) {
		const code = {id, code: this.#idgen()}
		const key = this.data(code.id)
		await this.transaction({
			watch: [key],
			handler: async (pipe) => {
				pipe['json.set'](key, '$', this.serialize(code), 'nx')
				pipe['expire'](key, expires)
			},
		})
		return code
	}

	async consume(id: string) {
		const key = this.data(id)
		const res = await this.transaction(async (pipe) => {
			pipe['json.get'](key, '$')
			pipe['del'](key)
		})
		if (!res[0]) return null
		return this.parse(res[0])
	}
}
