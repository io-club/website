import type {Meta, TocEntry} from '@ioclub/mdvue'

import { defineComponent, provide, reactive } from 'vue'

import Default from './default'
import News from './news'
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
		return () => <News>
			{() => {
				// const ret = [<button onClick={() => console.log(Object.entries(meta))}>show</button>]
				const ret = []
				const generateMenu = (i_current?: TocEntry): VNode => {
					const value = i_current?.value;
					const id = i_current?.id;
					const depth = i_current?.depth
					if (!i_current?.children) {
						// 普通item
						return h('li',
							{ 
								class: "\
								px-2 my-1 border-l-3 text-gray-600  \
								hover:(border-green-700  text-blue-500 bg-gray-50 hand) ",
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
								// 下拉菜单标题	
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
										h('div',{
											// "⯅	⯆	⯇	⯈"
										}, [ "⯈ " + value])
									]
								),
								h(
									'ul', // 下拉菜单
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
						<div class="w-full flex">
							<div class="max-w-75/100 bg-green-200 ">
								<article  class="prose max-w-100/100 bg-blue-200">
									{slots.default()}
								</article>
							</div>
							<div class="w-25/100 overflow-y-scroll ">
								<div class="overflow-auto relative" style="max-height:99vh">
									{ generateMenu(meta.toc?.at(0)) }
								</div>
							</div>
						</div>
					)
				}
				return ret
			}}
		</News>
	}
})
