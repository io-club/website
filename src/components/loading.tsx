import {VueComponent as Loading} from '@mdi/svg/svg/loading.svg'
import {defineComponent} from 'vue'

export default defineComponent({
	setup() {
		return () => <Loading class="animate-spin text-blue w-32 h-32" />
	}
})
