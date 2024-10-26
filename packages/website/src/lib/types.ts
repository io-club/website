import type { Generated } from 'kysely'

export interface UserTable {
	id: string
	username: string
	password: string
	created_at: Generated<string>
}

export interface SessionTable {
	id: string
	user_id: string
	expires_at: string
}

export interface DatabaseSchema {
	user: UserTable
	session: SessionTable
}

export interface Route {
	path: string
	slug: string
}
