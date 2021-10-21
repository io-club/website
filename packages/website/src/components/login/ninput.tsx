import type {PropType} from 'vue'

import { defineComponent } from 'vue'
export default defineComponent({
	props: {
		placeholder: {
			type: String,
			default: '',
		},
		value: {
			type: String,
			required: true,
		},
		type: String,
		label: String,
		msg: String,
		onChange: Function as PropType<(ev: Event) => void>,
	},
	setup(props, {slots}) {
		return () => {
			const hidden = props.value.length !== 0
			return <div 
				w:w='full'
				w:m="b-2"
				w:children="mb-1 text-sm"
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
						onChange={props.onChange}
						type={props.type} value={props.value} placeholder={props.placeholder} />
					<span>
						{slots.rightbutton ? slots.rightbutton() : null}
					</span>
					
				</div>
				{/* {!props.msg ? null :<div w:text="red-500" w:display={hidden ? 'hidden' : ''}>{props.msg}</div>} */}
			</div>
		}
	},
})
