import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'

import props from '@/utils/props'

export default defineComponent({
	props: {
		...props,
		to: {
			type: String,
			default: '#',
		},
	},
	setup(props, {slots}) {
		return () => <RouterLink {...props}>{() => slots.default ? slots.default() : null}</RouterLink>
	},
})
