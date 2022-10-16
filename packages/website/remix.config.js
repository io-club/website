/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	ignoredRouteFiles: ['**/.*'],
	server: 'server/index.ts',
	serverDependenciesToBundle: [
		/^remix-auth/,
		/^nanoid/,
	],
}
