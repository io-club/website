import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { GitHub } from 'arctic'
import { sha256 } from '@oslojs/crypto/sha2'

import { kysely } from '@lib/db'

const refreshDay = 1000 * 60 * 60 * 24 * 15
const extendedDay = 1000 * 60 * 60 * 24 * 30
export const cookieName = 'sdfdsf'

export interface DatabaseUser {
	id: string
	username: string
	password: string
}

export interface Session {
	id: string
	user_id: string
	expires_at: string
}

function generateSessionToken(): string {
	const bytes = new Uint8Array(20)
	crypto.getRandomValues(bytes)
	const token = encodeBase32LowerCaseNoPadding(bytes)
	return token
}

export async function createSession(user_id: string): Promise<string> {
	const token = generateSessionToken()
	const sessid = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const session: Session = {
		id: sessid,
		user_id,
		expires_at: new Date(Date.now() + extendedDay).toUTCString(),
	}
	await kysely.insertInto('session').values(session).execute()
	return token
}

export async function validateUser(username: string, password: string) {
	const exist = await kysely
		.selectFrom('user')
		.select(['id'])
		.where('username', '=', username)
		.where('password', '=', password)
		.executeTakeFirst()
	return exist?.id
}

export async function invalidateSession(session_id: string): Promise<void> {
	await kysely.deleteFrom('session').where('id', '=', session_id).execute()
}

export async function validateSession(token: string): Promise<Session | null> {
	const sessid = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const session = await kysely
		.selectFrom('session')
		.select(['session.id', 'user_id', 'expires_at'])
		.innerJoin('user', 'user.id', 'session.user_id')
		.where('session.id', '=', sessid)
		.executeTakeFirst()
	if (!session) {
		return null
	}
	const duration = Date.now() - new Date(session.expires_at).getTime()
	if (duration >= 0) {
		await invalidateSession(sessid)
		return null
	}
	if (duration >= -refreshDay) {
		session.expires_at = new Date(Date.now() + extendedDay).toDateString()
		await kysely.updateTable('session').set('expires_at', session.expires_at).where('id', '=', sessid).execute()
	}
	return session
}

export const github = new GitHub(import.meta.env.GITHUB_OAUTH_ID, import.meta.env.GITHUB_OAUTH_SECRET, null)
