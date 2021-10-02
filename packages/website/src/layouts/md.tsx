import type {Meta} from '@ioclub/mdvue'

import { defineComponent, provide, reactive } from 'vue'

import Default from './default'
// import {article} from "windicss/plugin/typography"
export default defineComponent({
	props: {'name': String},
	setup(_, {slots}) {
		const meta: Meta = reactive({})
		const updateMeta = (n: Meta) => {
			meta.frontmatter = n.frontmatter
			meta.toc = n.toc
		}
		watchEffect(() =>
			console.log(meta), {
			flush: 'post'
		})
		provide('md_update_meta', updateMeta)
		return () => <Default>
			{() => {
				// const ret = [<button onClick={() => console.log(Object.entries(meta))}>show</button>]
				const ret = []
				const generateMenu = (i_current?: TocEntry): VNode => {
					const value = i_current?.value;
					const id = i_current?.id;
					const depth = i_current?.depth
					if (!i_current?.children) {
						return h('li',
							{ 
								class: "\
								px-2 my-1 border-l-3 text-gray-600 border-green-50 \
								hover:(border-green-700  text-blue-500 bg-gray-50 hand) ",
								// text: "gray-400 hover:(gray-800)",
								// border: "l-3 green-200 hover:(green-600 gray-800)",
								
							},
							[
								h('a',{href: "#" + id}, [value])
							])
					} else {
						return h(
							'div',
							{
								class: "",
							},
							[
								
								h(
									'div',
									{
										class: "\
											hover(hand )\
										",
										onclick: () => {
											document.getElementById("submenu" + id)?.toggleAttribute("hidden")
										}
									},
									[
										value
										// h('a',{href: "#" + id}, [value])
									]
								),
								h(
									'ul',
									{
										id: "submenu" + id,
										class: "mx-5 \
											hover(hand )\
										",
									},
									[
										i_current?.children?.map(x => generateMenu(x))
									]
								)
							]
						);
					} 
				}

				if (slots.default) {
					ret.push(
						<div class="flex">

							<div class="px-2">
								{/* <p>{meta.frontmatter?.title ?? 'Loading'}</p> */}
								<div class="overflow-hidden">
									{ generateMenu(meta.toc?.at(0)) }
								</div>
							</div>
							<div class="px-2 bg-gray-200">
								<article  class="prose">
									{slots.default()}
								</article>
							</div>
						</div>
					)
				}
				return ret
			}}
		</Default>
	}
})
