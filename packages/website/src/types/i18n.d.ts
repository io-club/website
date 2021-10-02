import type s from '@/locales/zh_CN'

import 'vue-composable'

type json = typeof s

declare module 'vue-composable' {
	interface i18n extends json {}
}
