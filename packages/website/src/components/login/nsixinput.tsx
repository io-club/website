import type {PropType, Ref} from 'vue'

import {defineComponent, ref} from 'vue'
export default defineComponent({
	props: {
		label: String,
		msg: String,
		value: String,
		onChange: Function as PropType<(e: string) => void>,
	},
	setup(props) {
		const els: Ref<HTMLInputElement>[] = []
		return () => {
			const ret = []
			const inputs = []
			for (let i = 0; i < 6; i++) {
				inputs[i] = ref(null)
				inputs.push(
					<div
						w:p="1"
						w:border="1 solid gray-200 rounded"
					>
						<input
							ref={els[i]}
							w:w="6"
							w:h="6"
							w:outline="none"
							w:caret="green-500"
							w:text="center"
							onChange={(e) => {
								if (i != 5 && e.target?.value != '') {
									els[i + 1].value.focus()
								}
							}}
							type='tel' maxlength='1' />
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
						{!props.msg ? null : <span w:text="red-500">∗</span>}
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


