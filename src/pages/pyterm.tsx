import {defineComponent} from 'vue'

import PyTerm from '/@/components/pyterm'

export default defineComponent({
	setup() {
		return () => <PyTerm id="terminal" class="flex-grow p-8" />
	}
})
