import {NowRequest, NowResponse} from '@vercel/node'
import {Deta} from 'deta'
import Status from 'http-status-codes'

export interface Meta {
	records: string[];
}

export interface Data {
	key: string;
	content: unknown;
}

const hanlder = async (request: NowRequest, response: NowResponse): Promise<unknown> => {
	const {pastebin = ''} = request.query
	if (pastebin instanceof Array) {
		return response.status(Status.BAD_REQUEST).send('invalid path')
	}
	if (!process.env.DETA_PROJECT) {
		return response.status(Status.SERVICE_UNAVAILABLE).send('database down')
	}
	try {
		if (pastebin !== '') {
			if (request.method !== 'GET') {
				return response.status(Status.BAD_REQUEST).send('invalid method')
			}
		} else {
			if (request.method !== 'POST') {
				return response.status(Status.BAD_REQUEST).send('invalid method')
			}
			switch (request.headers['content-type']) {
				case 'application/json':
				case 'application/x-www-form-urlencoded':
				case 'text/plain':
					break
				default:
					return response.status(Status.BAD_REQUEST).send('unsupported content type')
			}
		}

		const deta = Deta(process.env.DETA_PROJECT)
		const db = deta.Base('paste')
		if (pastebin !== '') {
			const data = await db.get(pastebin) as Data
			return response.status(Status.OK).send(data)
		} else {
			const {key} = await db.put({content: request.body} as Data)
			const meta = (await db.get('meta') || {records: []}) as Meta
			while (meta.records.length > 3000) {
				const k = meta.records.shift()
				if (k) await db.delete(k)
			}
			meta.records.push(key)
			await db.put(meta, 'meta')
			return response.status(Status.OK).send(key)
		}
	} catch (err) {
		console.error(err)
		return response.status(Status.INTERNAL_SERVER_ERROR).send('unknown error')
	}
}

export default hanlder
