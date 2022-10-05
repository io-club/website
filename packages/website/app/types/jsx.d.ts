import type { AttributifyNames } from './attributify.d'

declare namespace JSX {
	interface ReservedProps extends Partial<Record<import('./attributify.d').AttributifyNames<'w:'>, string>> {
	}
	interface HTMLAttributes<T> extends Partial<Record<AttributifyNames<'w:'>, string>> {
	}
}
