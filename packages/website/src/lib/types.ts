import type { Generated } from 'kysely'

export interface UserTable {
	id: Generated<number>
	name: string
}

export interface SessionTable {
	id: string
	user_id: number
	expires_at: Date
}

export interface DatabaseSchema {
	user: UserTable
	session: SessionTable
}

export interface Route {
	path: string
	slug: string
}
