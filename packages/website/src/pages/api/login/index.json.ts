import { cookieName, createSession, validateUser } from '@lib/auth'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ request, cookies }) => {
	const data = await request.json()
	const user_id = await validateUser(data.name, data.ss)
	if (!user_id) {
		return new Response(
			JSON.stringify({
				name: 'Astro',
				url: 'https://astro.build/',
			}),
		)
	}

	const token = await createSession(user_id)
	cookies.set(cookieName, token, {
		path: '/',
	})
	return new Response(
		JSON.stringify({
			name: 'fsdi',
			url: 'https://astro.build/',
		}),
	)
}
