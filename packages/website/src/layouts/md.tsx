import type {Meta} from '@ioclub/mdvue'

import { defineComponent, provide, reactive } from 'vue'

import Default from './default'

export default defineComponent({
	props: {'name': String},
	setup(_, {slots}) {
		const meta: Meta = reactive({})
		const updateMeta = (n: Meta) => {
			meta.frontmatter = n.frontmatter
			meta.toc = n.toc
		}
		provide('md_update_meta', updateMeta)
		return () => <Default>
			{() => {
				const ret = [<button onClick={() => console.log(Object.entries(meta))}>show</button>]
				if (slots.default)
					ret.push(...slots.default())
				return ret
			}}
		</Default>
	}
})
