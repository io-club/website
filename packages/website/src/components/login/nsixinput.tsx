
import NVarification from 'virtual:icons/ic/baseline-domain-verification'
import { defineComponent, ref } from 'vue'
export default defineComponent({
	props: {
		label: String,
		msg: String,
	},
	setup(props, context) {
		const hidden = props.value ? props.value.length !== 0 : false
		// toastify-js
		return () => {
			const ret = []
			const inputs = []

			const els = ref<HTMLElement[]>([])
			
			const pushInput = (el: HTMLElement) => {
				els.value.push(el)
			}
			context.expose({
				getValue: () => {
					return els.value.map((x) => { return x.value}).join('')
				}
			})
			for (let i = 0; i < 6; i++) {
				inputs.push(
					<div
						w:p="1"
						w:border="1 solid gray-200 rounded"
					>
						<input 
							ref={pushInput}
							w:w="6" 
							w:h="6" 
							w:outline="none"
							w:caret="green-500"
							w:text="center"
							onInput={() => {
								if (i != 5 && els.value[i].value != '') {
									els.value[i + 1].focus()
								}
							}}
							type="text" id={`${i}`} maxlength='1'/>
					</div>
				)
			}
			ret.push(
				<div
					w:w="full"
					w:m="b-2"
					w:children="mb-1 text-sm"
				>
					<div>
						<span>{props.label} </span>
						{!props.msg ? null :<span w:text="red-500" w:display={hidden ? 'hidden' : ''}>∗</span>}
					</div>
					<div
						w:w="full"
						w:flex='~ row'
						w:justify="between"
					>
						{inputs}
					</div>

				</div>
			)
			return ret
		}
	},
})


