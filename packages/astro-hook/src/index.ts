import { z } from 'astro/zod'

import { defineIntegration } from 'astro-integration-kit'
import type { AstroConfig, AstroIntegrationMiddleware } from 'astro'

export const optionsSchema = z
	.object({
		setup: z.custom<(a: AstroConfig, b: (c: AstroIntegrationMiddleware) => void) => void>().optional(),
		done: z.custom<() => void>().optional(),
	})
	.default({})

export default defineIntegration({
	name: 'astro-hook',
	optionsSchema,
	setup({ options }) {
		return {
			hooks: {
				'astro:config:setup': ({ config, addMiddleware }) => {
					if (options.setup) options.setup(config, addMiddleware)
				},
				'astro:server:done': () => {
					if (options.done) options.done()
				},
			},
		}
	},
})
