import '@iconify/vue'

import {DefineComponent} from 'vue'

declare module '@iconify/vue' {
	interface Icon extends DefineComponent<{icon: string}> {
	}
}
