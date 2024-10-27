import SqliteDatabase from 'better-sqlite3'
import { Kysely, SqliteDialect, sql } from 'kysely'

import type { DatabaseSchema } from '@lib/types'
import { nanoid } from 'nanoid'

export const kysely = new Kysely<DatabaseSchema>({
	dialect: new SqliteDialect({
		database: new SqliteDatabase(import.meta.env.DB ?? ':memory:'),
	}),
})

await kysely.schema
	.createTable('user')
	.ifNotExists()
	.addColumn('id', 'text', (c) => c.notNull().primaryKey())
	.addColumn('username', 'text', (c) => c.unique())
	.addColumn('github_id', 'text', (c) => c.unique())
	.addColumn('password', 'text')
	.addColumn('created_at', 'timestamp', (c) => c.defaultTo(sql`current_timestamp`).notNull())
	.execute()

await kysely.schema
	.createTable('session')
	.ifNotExists()
	.addColumn('id', 'text', (c) => c.notNull().primaryKey())
	.addColumn('user_id', 'text')
	.addColumn('expires_at', 'timestamp', (c) => c.notNull())
	.execute()

const tables = await kysely.introspection.getTables()
for (const v of tables) {
	console.log(v)
}
await kysely.insertInto('user').values({ id: nanoid(), username: '33', password: '44' }).execute()
