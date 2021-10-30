import type { PropType } from 'vue'

import ILoading from 'virtual:icons/eos-icons/loading'
import { defineComponent } from 'vue'
export default defineComponent({
	props: {
		loading: {
			type: Boolean,
			default: false,
		},
		disabled: Boolean,
		onClick: Function as PropType<(ev: Event) => void>,
	},
	setup(props, {slots}) {
		return () => {
			return <button
				disabled={props.disabled}
				w:text='true-gray-50'
				w:bg='gray-700'
				w:p='x-5 y-2'
				w:transform='~ active:(scale-90)'
				onClick={props.onClick}
			>
				{() => [
					!props.loading ? null : <ILoading w:display='inline-block' w:text='text-bottom' w:m='r-5px'/>,
					slots.default ? slots.default() : null,
				]}
			</button>
		}
	},
})
