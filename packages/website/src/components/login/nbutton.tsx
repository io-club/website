import LoadingCirclr from 'virtual:icons/eos-icons/loading'
import { defineComponent } from 'vue'
export default defineComponent({
	props: {
		value: {
			type: String,
			default: '',
		},
		p: String,
	},
	setup(props, {slots}) {
		return () => <div
			w:children="transition-transform transform duration-500"
		>
			<button
				w:bg="gradient-to-r 
				hover:(gradient-to-br) active:(gradient-to-l)
				"
				w:gradient="from-fuchsia-400 to-blue-400"
				w:p="1 x-20"
				w:border="~ rounded-1xl light-blue-400"
				w:text="14 white"
				w:outline="none focus:(none)"
				onClick={() => {console.log('点击按钮')}}
			>
				<div 
					w:flex="~ row"
					w:text="center"
					w:align="items-center"
					w:justify="center"
					w:children="pl-1"
				>
					<span w:pos="inline">
						<LoadingCirclr/>
						{slots.default ? slots.default() : null}
					</span>
					<span>
						{props.value}
					</span>
					<span>
						{/* Loading */}
					</span>
				</div>
			</button>
		</div>

	},
})
