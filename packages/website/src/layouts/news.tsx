import type {Meta, TocEntry} from '@ioclub/mdvue'

import { defineComponent, provide, reactive } from 'vue'

import Default from './default'
// import {article} from "windicss/plugin/typography"
export default defineComponent({
	props: {'name': String},
	setup(_, {slots}) {
		// const meta: Meta = reactive({})
		// const updateMeta = (n: Meta) => {
		// 	meta.frontmatter = n.frontmatter
		// 	meta.toc = n.toc
		// }
		// provide('md_update_meta', updateMeta)
		return () => <Default>
			{() => {
				// const ret = [<button onClick={() => console.log(Object.entries(meta))}>show</button>]
				const ret = []

				if (slots.default) {
					ret.push(
                        <div class="flex absolute">
                            <div class="w-20/100">
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                                this is a content
                            </div>
							<div class="w-80/100">
                            	{slots.default()}
							</div>
                        </div>
					)
				}
				return ret
			}}
		</Default>
	}
})
