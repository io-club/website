/// <reference path="../.astro/types.d.ts" />

import type { AttributifyNames } from '@unocss/preset-attributify'
import type { Session } from '@lib/auth'

declare global {
	namespace App {
		interface Locals {
			session: Session | null
		}
	}

	namespace astroHTML.JSX {
		interface HTMLAttributes extends Partial<Record<AttributifyNames<'w-'>, string | boolean>> {}
	}
}
