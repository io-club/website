import type {PropType} from 'vue'

import { defineComponent } from 'vue'
export default defineComponent({
	props: {
		value: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			default: 'text',
		},
		placeholder: {
			type: String,
			default: '',
		},
		msg: {
			type: String,
			default: '',
		},
		'class': String,
		'w:bg': String,
		'w:gradient': String,
		onChange: Function as PropType<(ev: string) => void>,
	},
	setup(props, {slots}) {
		return () => {
			const hidden = props.value.length !== 0
			return <div 
				w:w='full'
				w:child="mb-1 text-sm"
			>	
				<div>
					<span>{props.label}</span>
					{!props.msg ? null :<span w:text="red-500" w:display={hidden ? 'hidden' : ''}>∗</span>}
				</div>
				<div
					w:flex="~ row"
					w:p="2"
					w:border="~ rounded hover:(green-300) focus:(2)"
					w:shadow="focus:(md green-400)"
					w:transform="duration-200 hover:(border-green-300)"
					w:align="items-center"
				>
					<span w:pos="inline">{slots.icon ? slots.icon() : null}</span>
					<input
						w:w="full"
						w:p="l-2"
						w:outline="none"
						w:caret="green-500"
						type={props.type}
						value={props.value}
						placeholder={props.placeholder}
						class={props['class']}
						w:bg={props['w:bg']}
						w:gradient={props['w:gradient']}
						onChange={e => props.onChange?.((e.target as HTMLInputElement).value)}
					/>
					<span>
						{slots.rightbutton ? slots.rightbutton() : null}
					</span>
				</div>
			</div>
		}
	},
})
