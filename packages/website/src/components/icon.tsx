import { defineComponent } from 'vue'

export default defineComponent({
	props: {
		desc: {
			type: String,
			default: '#',
		},
	},
	setup(props, {slots}) {
		return () => <div>
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
			<div w:text="gray-800 sm center">
				<span>{props.desc}</span>
			</div>
		</div>
	},
})
