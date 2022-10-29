/* @type import("@remix-run/dev").AppConfig */
module.exports = {
	ignoredRouteFiles: ['**/.*'],
	server: 'server/index.ts',
	watchPaths: [
		'server',
	],
	serverDependenciesToBundle: [
		/^remix-auth/,
		/^nanoid/,
	],
}
