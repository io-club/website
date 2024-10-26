import { defineMiddleware } from 'astro:middleware'
import { cookieName, validateSession } from '@lib/auth'

export const onRequest = defineMiddleware(async ({ locals, cookies }, next) => {
	const sessid = cookies.get(cookieName)?.value
	if (!sessid) {
		locals.session = null
		return next()
	}

	locals.session = await validateSession(sessid)
	console.log(cookies, sessid, locals.session)
	if (!locals.session) {
		cookies.delete(cookieName)
	}
	return next()
})
