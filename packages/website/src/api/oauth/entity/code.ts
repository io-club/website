import type {OAuthAuthCode, OAuthAuthCodeRepository, OAuthClient, OAuthScope, OAuthUser} from '@jmondi/oauth2-server'
import type {JTDDataType} from '~/alias/jtd'
import type {Config} from '~/api/oauth'
import type {FastifyInstance} from 'fastify'

import {customAlphabet} from 'nanoid'
import {join} from 'pathe'

import {BaseRepository} from '~/api/entity/base'

import {clientDefinition} from './client'
import {scopeDefinition} from './scope'
import {userDefinition} from './user'

export const codeDefinition = {
	properties: {
		code: { type: 'string', metadata: { format: 'alnun' } },
		expiresAt: { type: 'timestamp' },
		clientId: clientDefinition.properties.id,
		scopeNames: { elements: scopeDefinition.properties.name },
	},
	optionalProperties: {
		redirectUri: { type: 'string' },
		codeChallenge: { type: 'string' },
		codeChallengeMethod: { enum: ['S256', 'plain'] },
		userId: userDefinition.properties.id,
	},
} as const

type T = JTDDataType<typeof codeDefinition>
export class CodeRepository extends BaseRepository<T> implements OAuthAuthCodeRepository {
	#idgen: () => string

	constructor(app: FastifyInstance, cfg: Config) {
		super({
			redis: app.redis,
			data: join(cfg.prefix, 'code', 'data'),
			id: (a) => `${a.code}`,
			parser: app.ajv.compileParser(codeDefinition),
			serializer: app.ajv.compileSerializer(codeDefinition),
		})
		this.#idgen = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 21)
	}

	async del(...ids: string[]) {
		await super.delWithOpts({}, ...ids)
	}

	async issueAuthCode(client: OAuthClient, user: OAuthUser | undefined, _scopes: OAuthScope[]) {
		// TODO: we only need to init
		// code/client/user according to the source code
		// https://github.com/jasonraimondi/ts-oauth2-server/blob/0bc94c57ece8ec8bc07057273b12ea555b9b5f00/src/grants/auth_code.grant.ts#L253-L272
		return {
			code: this.#idgen(),
			client,
			user,
		} as unknown as OAuthAuthCode
	}

	async persist(authCode: OAuthAuthCode) {
		// TODO: fix type cast
		return await this.add('upsert', authCode as unknown as T)
	}

	async isRevoked(authCode: string) {
		return await this.exists(authCode) == 0
	}

	async getByIdentifier(authCode: string) {
		return (await this.getWithPath(authCode))[0] as OAuthAuthCode
	}

	async revoke(authCode: string) {
		return await this.delWithOpts({}, authCode)
	}
}
