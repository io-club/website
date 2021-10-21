import { defineComponent } from 'vue'

export default defineComponent({
	props: {
		desc: {
			type: String,
			default: '#',
		},
	},
	setup(props, {slots}) {
		return () => <div
			w:flex="~ col "
			w:text="center"
			w:align="items-center"
		>
			<div 
				w:flex="~"
				w:justify="center"
				w:align="items-center"
				w:w="10"
				w:h="10"
				w:border="rounded-1/2"
				w:bg="gray-800"
				w:text="white center">
				{slots.default ? slots.default() : null}
			</div>
			<span w:text="gray-800 sm" w:p="r-2">{props.desc}</span>
		</div>
	},
})
