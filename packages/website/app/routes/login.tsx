import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime'

import { Form } from '@remix-run/react'

export default function Screen() {
	return (
		<Form method="post" w-flex="~ col" w-justify="content" w-align="center">
			<input type="email" name="email" defaultValue="a@b.com" required />
			<input
				type="password"
				name="password"
				defaultValue="tt"
				autoComplete="current-password"
				required
			/>
			<button>Sign In</button>
		</Form>
	)
}

export const action: ActionFunction = async ({ request, context }:any) => {
	return await context.auth.authenticate('user-pass', request, {
		successRedirect: '/',
		failureRedirect: '/register',
	})
}


export const loader: LoaderFunction = async ({ request, context }:any) => {
	try {
		const res = await context.graphql('{ users(first: 100) { nodes { id, nick, email } } }')
		console.log(res.data?.users)
	} catch (err) {
		console.error(err)
	}
	return await context.auth.isAuthenticated(request, {
		successRedirect: '/home',
	})
}
