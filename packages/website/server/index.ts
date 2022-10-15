import type { User } from '@prisma/client'

import fastifyStatic from '@fastify/static'
import { createRequestHandler } from '@mcansh/remix-fastify'
import { PrismaClient } from '@prisma/client'
import * as serverBuild from '@remix-run/dev/server-build'
import { createCookieFactory, createSessionStorageFactory } from '@remix-run/server-runtime'
import { sign, unsign } from 'cookie-signature'
import fastify from 'fastify'
import fastifyRacing from 'fastify-racing'
import { nanoid } from 'nanoid'
import * as path from 'path'
import { Authenticator } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'

async function start() {
	const cwd = process.cwd()
	const env = process.env

	const app = fastify()

	await app.register(fastifyRacing, {
		handleError: true,
	})

	await app.register(fastifyStatic, {
		root: path.join(cwd, 'public'),
		wildcard: false,
	})

	if (!app.hasContentTypeParser('*')) {
		app.addContentTypeParser('*', (_request, payload, done) => {
			done(null, payload)
		})
	}

	const db = new PrismaClient()

	app.all('*', createRequestHandler({
		build: serverBuild,
		mode: env.MODE,
		getLoadContext() {
			const sess = createSessionStorageFactory(createCookieFactory({
				async sign(value, secret) {
					return sign(value, secret)
				},
				async unsign(value, secret) {
					return unsign(value, secret)
				},
			}))({
				cookie: {
					name: env.COOKIE_NAME,
					maxAge: 3600,
					httpOnly: true,
					sameSite: true,
					path: '/',
					secure: env.MODE === 'production',
					secrets: env.COOKIE_SECRETS.split(','),
				},
				async createData(data, expires) {
					const id = nanoid()
					await db.session.create({ data: { id, sess: JSON.stringify(data), expires: expires } })
					return id
				},
				async readData(id) {
					const sess = await db.session.findUnique({ where: { id } })
					if (new Date().getTime() >= sess?.expires.getTime()) {
						await db.session.delete({ where: { id } })
						return null
					}
					return sess
				},
				async updateData(id, data, expires) {
					await db.session.update({ where: { id }, data: { sess: JSON.stringify(data), expires: expires } })
				},
				async deleteData(id) {
					await db.session.delete({ where: { id } })
				},
			})

			const auth = new Authenticator<User>(sess, {
				sessionKey: '_session',
			}).use(
				new FormStrategy(async ({ form }) => {
					const email = form.get('email').toString()
					const password = form.get('password').toString()
					const user = await db.user.findUniqueOrThrow({ where: { email } })
					if (user.password === password) return user
					return null
				}),
				'user-pass'
			)

			return {
				db,
				sess,
				auth,
			}
		}
	}))


	const port = Number(env.PORT)
	const address = await app.listen({
		port,
		host: '0.0.0.0'
	})

	if (env.MODE !== 'production') {
		console.log(`Fastify server listening at http://127.0.0.1:${port}`)
	} else {
		console.log(`Fastify server listening at ${address}`)
	}
}

start().catch((error) => {
	console.error(error)
	process.exit(1)
})
