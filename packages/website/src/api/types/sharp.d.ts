import type sharp from 'sharp'

import 'fastify'

declare module 'fastify' {
	function _sharp(options?: sharp.SharpOptions): sharp.Sharp
	function _sharp(
		input?:
		| Buffer
		| Uint8Array
		| Uint8ClampedArray
		| Int8Array
		| Uint16Array
		| Int16Array
		| Uint32Array
		| Int32Array
		| Float32Array
		| Float64Array
		| string,
		options?: sharp.SharpOptions,
	): sharp.Sharp
	interface FastifyInstance {
		sharp: typeof _sharp
	}
}
