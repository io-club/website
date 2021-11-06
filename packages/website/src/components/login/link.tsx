import type { PropType, VNode } from 'vue'

import {defineComponent} from 'vue'

import Link from '../link'
export default defineComponent({
	props: {
		to: {
			type: String,
			default: '#',
		},
		icon: {
			type: Object as PropType<VNode>
		},
		onClick: Function as PropType<(ev: Event) => void>,
	},
	setup(props, {slots}) {
		return () => <div
			w:text='true-gray-500 '
			w:p='y-2'
			w:border='none'
			onClick={props.onClick}
		>
			<div w:display='inline-block' w:text='text-bottom' w:m='r-5px'>
				{props.icon}
			</div>
			<Link to={props.to}><span w:transition="~ duration-200 ease-in-out" w:text='hover:(gray-800)'>{() => slots.default ? slots.default() : null}</span></Link>
		</div>
	},
})
