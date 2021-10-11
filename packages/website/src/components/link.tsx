import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'

export default defineComponent({
	props: {
		to: {
			type: String,
			default: '#',
		},
	},
	setup(props, {slots}) {
		return () => <RouterLink to={props.to}>{() => slots.default ? slots.default() : null}</RouterLink>
	},
})
