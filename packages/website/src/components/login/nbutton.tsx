import type {PropType} from 'vue'

import { defineComponent } from 'vue'
export default defineComponent({
	props: {
		value: {
			type: String,
			default: '',
		},
		type: String,
		p: String,
		onChange: Function as PropType<(ev: Event) => void>,
	},
	setup(props, {slots}) {
		return () => <div
			w:w='full'
			w:children="transition-transform transform duration-500"
		>
			<button
				w:w='full'
				class="hover:(scale-103) "
				w:bg="gradient-to-r hover:(scale-110) active:(gradient-to-l)"
				w:gradient="from-green-400 via-cyan-400 to-blue-400"
				w:opacity='90'
				w:p="1 x-20"
				w:border="~ rounded-1xl light-blue-400"
				w:text="14 white"
				w:outline="none focus:(none)"
				onClick={props.onChange}
			>
				<div 
					w:flex="~ row"
					w:text="center"
					w:align="items-center"
					w:justify="center"
					w:children="pl-1"
				>
					<span w:pos="inline">
						{slots.default ? slots.default() : null}
					</span>
					<span>
						{props.value}
					</span>
				</div>
			</button>
		</div>

	},
})
