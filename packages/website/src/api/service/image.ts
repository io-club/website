import type {FastifyPluginCallback} from 'fastify'
import type {FromSchema} from 'json-schema-to-ts'

import status_code from 'http-status-codes'

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

const routes: FastifyPluginCallback = async function (app) {
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
		const img = await this.fetch(url).then(e => e.body)
		if (!img) {
			return res.code(status_code.BAD_REQUEST).send('invalid url')
		}
		img.pipe(transformer).pipe(res.raw)
	})
}

export default routes
