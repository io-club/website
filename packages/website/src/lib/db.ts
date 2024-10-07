import type { Database } from 'better-sqlite3'

import SqliteDatabase from 'better-sqlite3'
import { Kysely, SqliteDialect, sql } from 'kysely'

import type { DatabaseSchema } from '@lib/types'

export const db: Database = new SqliteDatabase(import.meta.env.DB ?? ':memory:')

const dialect = new SqliteDialect({
	database: db,
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const kysely = new Kysely<DatabaseSchema>({
	dialect,
})

const e = kysely.schema
	.createTable('user')
	.ifNotExists()
	.addColumn('id', 'text', (c) => c.notNull().primaryKey())
	.addColumn('username', 'text')
	.addColumn('password', 'text')
	.addColumn('created_at', 'timestamp', (c) => c.defaultTo(sql`current_timestamp`).notNull())
console.log(e.compile())
await e.execute()

const tables = await kysely.introspection.getTables()
for (const v of tables) {
	console.log(v)
}

/*
kysely.schema
	.createTable('session')
	.ifNotExists()
	.addColumn('id', 'text', (c) => c.notNull().primaryKey())
	.addColumn('username', 'text', (c) => c.notNull().unique())
	.addColumn('password', 'text', (c) => c.notNull())
	*/
