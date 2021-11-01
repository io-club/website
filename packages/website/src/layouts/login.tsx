import {defineComponent} from 'vue'

import Layout from '~/components/login/center'

export default defineComponent({
	props: {name: String},
	setup(_, {slots}) {
		return () => <Layout>{slots.default ? slots.default() : null}</Layout>
	},
})
