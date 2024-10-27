import type { APIRoute } from 'astro'
import type { OAuth2Tokens } from 'arctic'
import { nanoid } from 'nanoid'

import { cookieName, createSession, github } from '@lib/auth'
import { kysely } from '@lib/db'
import { Octokit } from '@octokit/rest'

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
	const code = url.searchParams.get('code')
	const state = url.searchParams.get('state')
	const storedState = cookies.get('github_oauth_state')?.value ?? null
	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 400,
		})
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400,
		})
	}

	let tokens: OAuth2Tokens
	try {
		tokens = await github.validateAuthorizationCode(code)
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400,
		})
	}

	const octokit = new Octokit({ auth: tokens.accessToken() })
	const ghuser = (await octokit.users.getAuthenticated()).data

	// TODO: Replace this with your own DB query.
	const user = { id: nanoid(), github_id: ghuser.id.toString() }
	await kysely.insertInto('user').values(user).execute()

	const token = await createSession(user.id)
	cookies.set(cookieName, token, {
		path: '/',
	})
	return redirect('/login')
}
