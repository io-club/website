import type { AttributifyNames } from './attributify.d'

declare module 'react' {
	interface HTMLAttributes<T> extends Partial<Record<AttributifyNames<'w:'>, string>> {}
}
