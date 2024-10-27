import type { APIRoute } from 'astro'

import { generateState } from 'arctic'

import { github } from '@lib/auth'

export const GET: APIRoute = async (context) => {
	const state = generateState()
	const url = github.createAuthorizationURL(state, [])

	context.cookies.set('github_oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax',
	})

	return context.redirect(url.toString())
}
