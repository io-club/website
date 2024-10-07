/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
//
import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare namespace App {
	interface Locals {
		session: import('lucia').Session | null
		user: import('lucia').User | null
	}
}

declare global {
  namespace astroHTML.JSX {
    interface HTMLAttributes extends AttributifyAttributes { }
  }
}
