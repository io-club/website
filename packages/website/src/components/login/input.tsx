import type { PropType } from 'vue'

import { defineComponent } from 'vue'
export default defineComponent({
	props: {
		placeholder: String,
		value: String,
		type: String,
		onChange: Function as PropType<(ev: string) => void>,
	},
	setup(props, {slots}) {
		return () => {
			return <input w:p='x-3px t-1px' w:m='t-5'
				placeholder={props.placeholder}
				value={props.value}
				w:text='placeholder-opacity-50' 
				w:display='inline' w:w='full' type={props.type ?? 'text'}
				w:border='b-2px black opacity-30'
				onChange={e => props.onChange?.((e.target as HTMLInputElement).value)}
			/>
		}
	},
})
