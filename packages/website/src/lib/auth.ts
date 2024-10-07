import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite'
import { Lucia } from 'lucia'

import { db } from '@lib/db'

export interface DatabaseUser {
	id: string
	username: string
	password: string
}

const adapter = new BetterSqlite3Adapter(db, {
	user: 'user',
	session: 'session',
})

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: import.meta.env.PROD,
		},
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
		}
	},
})

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia
		DatabaseUserAttributes: Omit<DatabaseUser, 'id'>
	}
}
