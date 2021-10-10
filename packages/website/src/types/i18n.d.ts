import type s from '@/locales/zh_CN'

import '@ioclub/composable'

type json = typeof s

declare module '@ioclub/composable' {
	interface T extends json {}
}
