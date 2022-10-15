/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	ignoredRouteFiles: ['**/.*'],
	server: 'server/index.ts',
	serverDependenciesToBundle: [
		/^@babylon/,
		/^remark/,
		/^rehype/,
		/^remix-auth/,
		/^nanoid/,
	],
}
