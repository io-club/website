import {defineComponent} from 'vue'

import Layout from '../layout'
export default defineComponent({
	props: {
	},
	setup(props, {slots}) {
		return () => <Layout><div
			w:flex='~ grow'
			w:justify='center'
			w:align='items-center'
			w:h='full'
			w:p='8'
			w:border='1'
		>
			<div
				w:w='100'
				w:p='12'
				w:align='items-center'
				w:border='1 '
			>
				{() => slots.default ? slots.default() : null}
			</div>
		</div></Layout>
	},
})
