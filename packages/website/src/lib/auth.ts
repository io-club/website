import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'

import { kysely } from '@lib/db'

const refreshDay = new Date(0, 0, 15).getTime()
const extendedDay = new Date(0, 0, 30).getTime()

export interface DatabaseUser {
	id: string
	username: string
	password: string
}

export interface Session {
	id: string
	user_id: number
	expires_at: Date
}

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20)
	crypto.getRandomValues(bytes)
	const token = encodeBase32LowerCaseNoPadding(bytes)
	return token
}

export async function createSession(token: string, user_id: number): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const session: Session = {
		id: sessionId,
		user_id,
		expires_at: new Date(Date.now() + extendedDay),
	}
	await kysely.insertInto('session').values(session).execute()
	return session
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await kysely.deleteFrom('session').where('id', '=', sessionId).execute()
}

export async function validateSession(token: string): Promise<Session | null> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const session = await kysely
		.selectFrom('session')
		.select(['session.id', 'user_id', 'expires_at'])
		.innerJoin('user', 'user.id', 'session.user_id')
		.where('id', '=', sessionId)
		.executeTakeFirst()
	if (!session) {
		return null
	}
	const duration = Date.now() - session.expires_at.getTime()
	if (duration >= 0) {
		await invalidateSession(sessionId)
		return null
	}
	if (duration >= -refreshDay) {
		session.expires_at = new Date(Date.now() + extendedDay)
		await kysely.updateTable('session').set('expires_at', session.expires_at).where('id', '=', sessionId).execute()
	}
	return session
}
