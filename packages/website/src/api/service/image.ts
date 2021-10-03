import type {FastifyPluginCallback} from 'fastify'
import type {FromSchema} from 'json-schema-to-ts'

import status_code from 'http-status-codes'
import QuickLRU from 'quick-lru'

const IImageSchema = {
	type: 'object',
	properties: {
		url: { type: 'string' },
		width: { type: 'number' },
		height: { type: 'number' },
		format: {enum: ['jpg', 'png', 'avif', 'webp']},
	},
	required: ['url'],
} as const

type IImage = FromSchema<typeof IImageSchema>

function keyGen(query: IImage) {
	return Object.values(query).join(':')
}

export interface Config {
	maxAge: number
	maxSize: number
}

const routes: FastifyPluginCallback<Config> = async function (app, options) {
	const lru = new QuickLRU({maxSize: options.maxSize, maxAge: options.maxAge});

	app.get<{
		Querystring: IImage,
	}>('/image', {
		schema: {
			querystring: IImageSchema,
		},
	}, async function(req, res) {
		const query = req.query

		let url = query.url
		if (url.startsWith('/')) {
			// internal resource
			url = `${req.protocol}://${req.hostname}${url}`
		}

		let transformer = this.sharp()
		if (query.width || query.height) {
			transformer = transformer.resize({
				width: query.width,
				height: query.height,
			})
		}
		if (query.format) {
			transformer = transformer.toFormat(query.format)
		}
		const key = keyGen(query)
		const v = lru.get(key)
		if (!v) {
			const img = await this.fetch(url).then(e => e.body)
			if (!img) {
				return res.code(status_code.BAD_REQUEST).send('invalid url')
			}
			const buffer = await img.pipe(transformer).toBuffer()
			lru.set(key, buffer)
		}
		return res.send(v)
	})
}

export default routes
