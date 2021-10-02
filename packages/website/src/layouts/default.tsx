import { defineComponent, ref } from 'vue'
import { setI18n } from 'vue-composable'

import Logo from '@/components/logo'
import zh_CN from '@/locales/zh_CN'

export default defineComponent({
	props: {'name': String},
	setup(_, {slots}) {
		const { i18n } = setI18n({
			locale: 'zh-cn',
			fallback: 'zh-cn',
			messages: {
				'zh-cn': zh_CN,
			},
		})
		const show = ref(false)
		return () => {
			const {header, title} = i18n.value.common
			const ret = []

			ret.push(
				<div 
					w:p="y-3 x-oi-6 x-os-5 x-o"
					w:bg="white"
					w:flex="~ wrap"
					w:justify="between"
					w:align="items-center"
				>
					<a w:flex="~" w:align="items-center" href="#" >
						<Logo w:h="8" w:m="r-2" />
						<span w:text="2xl" w:font="heavy">{ title }</span>
					</a>
					<button w:display="md:hidden" type="button" onClick={() => show.value = !show.value}>menu</button>
					<nav w:w="full md:3/4" w:m="<md:t-2">
						<ul
							w:flex="~"
							w:justify="around"
							w:children="border-b-2 transition-transform transform duration-100"
						>
							<li w:transform="hover:scale-110">
								<a href="/#about">{ header.about }</a>
							</li>
							<li w:transform="hover:scale-110">
								<a href="/notice">{ header.notice }</a>
							</li>
							<li w:text="gray-400">
								<a href="#">{ header.forum }</a>
							</li>
							<li w:text="gray-400">
								<a href="#">{ header.login }</a>
							</li>
						</ul>
					</nav>
				</div>
			)

			if (slots.default)
				ret.push(slots.default())

			ret.push(
				<div 
					w:bg="gray-800"
					w:h="min-20"
					w:text="white"
					w:flex="~"
					w:align="items-center"
					w:justify="center"
				>
					<p>By &copy; 2021 I/O club All rights reserved</p>
				</div>
			)

			return ret
		}
	},
})