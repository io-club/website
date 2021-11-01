import type { AttributifyNames } from 'windicss/types/jsx'

declare module '@vue/runtime-dom' {
	interface HTMLAttributes extends Partial<Record<AttributifyNames<'w:'>, string>> {
	}
}
