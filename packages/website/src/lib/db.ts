import SqliteDatabase from 'better-sqlite3'
import { Kysely, SqliteDialect, sql } from 'kysely'

import type { DatabaseSchema } from '@lib/types'

export const kysely = new Kysely<DatabaseSchema>({
	dialect: new SqliteDialect({
		database: new SqliteDatabase(import.meta.env.DB ?? ':memory:'),
	}),
})

await kysely.schema
	.createTable('user')
	.ifNotExists()
	.addColumn('id', 'text', (c) => c.notNull().primaryKey())
	.addColumn('username', 'text')
	.addColumn('password', 'text')
	.addColumn('created_at', 'timestamp', (c) => c.defaultTo(sql`current_timestamp`).notNull())
	.execute()

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
