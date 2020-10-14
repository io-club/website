import {defineComponent} from 'vue'

import PyTerm from '/@/components/pyterm'

export default defineComponent({
	setup() {
		return () => <section class="flex-grow flex flex-col p-8">
			<PyTerm id="terminal" class="flex-grow" />
		</section >
	}
})
