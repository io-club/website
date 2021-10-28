
import type { PropType } from 'vue'
import type {VNode} from 'vue'

import { defineComponent, FunctionalComponent, SVGAttributes } from 'vue'

export default defineComponent({
	props: {
		icon: {
			type: Object as PropType<VNode>
		},
		placeholder: String,
		value: String,
		onClick: Function as PropType<(ev: Event) => void>,
	},
	setup(props, {slots}) {
		return () => {
			return <button
				w:text='true-gray-500'
				w:p='y-2'
				w:border='none'
				w:transform='~ active:(scale-90)'
				onClick={props.onClick}
			>
				<div w:display='inline-block' w:text='text-bottom' w:m='r-5px'>
					{props.icon}
				</div>
				{props.value}
			</button>

		}
	},
})
