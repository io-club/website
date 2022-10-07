import type { AttributifyNames } from 'unocss/preset-attributify'

type Prefix = 'w-'

declare module 'react' {
	interface HTMLAttributes<T> extends Partial<Record<AttributifyNames<Prefix>, string>> {}
}
