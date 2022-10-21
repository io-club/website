import { Kind } from 'graphql'
import { nanoid } from 'nanoid'
import {
	connectionPlugin,
	interfaceType,
	makeSchema, mutationType, nonNull, objectType, queryType, scalarType, stringArg,
} from 'nexus'
import path from 'path'

// TODO: will be useful later
const DateTime = scalarType({
	name: 'Date',
	description: 'Date custom scalar type',
	parseValue(value) {
		return new Date(value as string)
	},
	serialize(value) {
		return (value as Date).toUTCString()
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.STRING) {
			return new Date(ast.value)
		}
		return null
	},
})

const Node = interfaceType({
	name: 'Node',
	definition(t) {
		t.id('id', { description: 'unique ID' })
	},
})

const User = objectType({
	name: 'User',
	definition(t) {
		t.implements(Node)
		t.nonNull.string('nick')
		t.string('email')
		t.string('phone')
		t.nonNull.string('password')
	},
})

const UserQuery = queryType({
	definition(t) {
		const generateArgs = (args: { first?: number | null, last?: number | null, before?: string | null, after?: string | null }) => {
			let takeFirst = true
			let take = args.first ?? 30
			if (args.last) {
				takeFirst = false
				take = args.last
			}
			let cursorAfter = true
			let cursor = args.after
			if (args.before) {
				cursorAfter = false
				cursor = args.before
			}

			return {
				take,
				cursor: !cursor ? undefined : {
					id: cursor,
				},
				orderBy: {
					'id': takeFirst === cursorAfter ? 'asc' : 'desc',
				} as Record<string, 'asc' | 'desc'>,
			}
		}

		t.field('user', {
			type: User,
			args: {
				id: stringArg(),
			},
			async resolve(_, args, ctx) {
				let id = args.id
				if (!id) {
					const user = await ctx.auth.isAuthenticated(await ctx.sess.getSession(ctx.req.headers.cookie))
					if (!user) {
						throw 'must pass id or authenticated'
					}
					id = user.id
				}
				return await ctx.db.user.findUniqueOrThrow({ where: { id } })
			},
		})
		t.connectionField('users', {
			type: User,
			extendConnection(t) {
				t.int('totalCount', {
					async resolve(_, args, ctx) {
						return await ctx.db.user.count(generateArgs(args))
					}
				})
			},
			async nodes(root, args, ctx, info) {
				return await ctx.db.user.findMany(generateArgs(args))
			},
		})
	},
})

const UserMutation = mutationType({
	definition(t) {
		t.field('user', {
			type: User,
			args: {
				nick: nonNull(stringArg()),
				password: nonNull(stringArg()),
				email: stringArg(),
				phone: stringArg(),
			},
			async resolve(_, args, ctx) {
				return await ctx.db.user.create({
					data: {
						id: nanoid(),
						nick: args.nick,
						password: args.password,
						email: args.email,
						phone: args.phone,
					}
				})
			},
		})
	}
})

export function createMercurius() {
	const env = process.env
	return makeSchema({
		features: {
			abstractTypeStrategies: {
				__typename: true,
				isTypeOf: false,
				resolveType: false,
			},
		},
		types: [
			User,
			UserQuery,
			UserMutation,
		],
		plugins: [
			connectionPlugin({
				includeNodesField: true,
				cursorFromNode(node) {
					return node?.id ?? ''
				},
			}),
		],
		shouldGenerateArtifacts: env.MODE !== 'production',
		outputs: {
			schema: path.resolve('./types/schema.graphql'),
			typegen: path.resolve('./types/nexus.d.ts'),
		},
		contextType: {
			module: path.resolve('./server/context.ts'),
			export: 'Context',
		},
	})
}
