import {defineComponent} from 'vue'

import Layout from '~/components/layout'

export default defineComponent({
	props: {name: String},
	setup(_, {slots}) {
		return () => <Layout
			aside={true}
			aside_show={true}
			article={true}
		>{slots.default}</Layout>
	},
})
