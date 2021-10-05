import { defineComponent } from 'vue'

export default defineComponent({
	props: {

	},
	setup(props) {
		const ret = []
        ret.push(
            <div>this is a card</div>
        )
        return ret
	}
})
