import 'virtual:windi.css'

import { defineComponent } from 'vue'
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
		return () => {
			const {header, title} = i18n.value.common
			const ret = []

			ret.push(
				<div class="py-3 px-oi-6 px-os-5 px-o bg-white flex justify-between items-center">
					<a class="inline-flex items-center" href="#">
						<Logo class="max-w-10 mr-2" />
						<span class="text-2xl font-heavy">{ title }</span>
					</a>
					<button class="md:hidden" type="button">menu</button>
					<nav class="<md:hidden w-3/4">
						<ul class="relative flex justify-around children:(border-b-2 transition-transform transform duration-100)">
							<li class="hover:scale-110">
								<a href="/#about">{ header.about }</a>
							</li>
							<li class="hover:scale-110">
								<a href="/notice">{ header.notice }</a>
							</li>
							<li class="text-gray-400">
								<a href="#">{ header.forum }</a>
							</li>
							<li class="text-gray-400">
								<a href="#">{ header.login }</a>
							</li>
						</ul>
					</nav>
				</div>
			)

			if (slots.default)
				ret.push(slots.default())

			ret.push(
				<div class="min-h-20 bg-gray-800 text-white flex items-center justify-center">
					<p>By &copy; 2021 I/O club All rights reserved</p>
				</div>
			)

			return ret
		}
	},
})

/*
<style lang="scss">
html {
	scroll-behavior: smooth;
	caret-color: transparent;
}
</style>
	 */
