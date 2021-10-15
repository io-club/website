import { defineComponent, ref } from 'vue'

export default defineComponent({
	props: {
		placeholder: {
			type: String,
			default: '',
		},
		value: String,
		label: String,
		required: {
			type: Boolean,
			default: false,
		},
		msg: String,
		
	},
	setup(props, {slots}) {
		const el = ref<HTMLElement | null>(null)
		const hidden = ref(true)
		const updateValue = inject('updateValue')
		return () =>
			<div 
				w:m="b-2"
				w:children="mb-1 text-sm"
			>
				<div>
					<span>{props.label} </span>
					{!props.required ? null :<span w:text="red-500" w:display={hidden.value ? 'hidden' : ''}>∗</span>}
				</div>
				<div
					w:flex="~ row"
					w:p="2"
					w:border="~ rounded hover:(green-300) focus:(2)"
					w:shadow="focus:(md green-400)"
					w:transform="duration-200 hover:(border-green-300)"
					w:align="items-center"
				>
					<span w:pos="inline">{slots.default ? slots.default() : null}</span>
					<input
						ref={el}
						w:p="l-2"
						w:outline="none"
						w:caret="green-500"
						onChange={(e) => {
							if (e.target.value == '') {
								hidden.value = false		
							} else {
								hidden.value = true
							}
							updateValue(e.target.value)
						}}
						type="text" value={props.value} placeholder={props.placeholder} />
				</div>
				<div w:text="red-500" w:display={hidden.value ? 'hidden' : ''}>{props.msg}</div>
			</div>
	},
})
