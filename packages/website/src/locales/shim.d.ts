import 'vue-composable'

import type s from '@/locales/zh_CN'

type json = typeof s

declare module 'vue-composable' {
	interface i18n extends json {}
}
