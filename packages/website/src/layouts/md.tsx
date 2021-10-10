import type {Meta} from '@ioclub/mdvue'

import {useI18n} from '@ioclub/composable'
import Menu from 'virtual:icons/mdi-light/menu'
import {defineComponent, provide, reactive, ref} from 'vue'

import Link from '@/components/link'
import Logo from '@/components/logo'
import MdMenu from '~/components/generater/mdmenu'

export default defineComponent({
	props: {'name': String},
	setup(_, {slots}) {
		const {i18n} = useI18n()
		const show = ref(false)
		provide('mobile_menu', show)

		const meta: Meta = reactive({})
		const updateMeta = (n: Meta) => {
			meta.frontmatter = n.frontmatter
			meta.toc = n.toc
		}
		provide('md_update_meta', updateMeta)

		const el_header = ref(null)
		const el_footer = ref(null)
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
					ref={el_header}
				>
					<Link w:flex="~" w:align="items-center" to="/" >{() => [
						<Logo w:h="8" w:m="r-2" />,
						<span w:text="2xl" w:font="heavy">{title}</span>,
					]}</Link>
					<button w:display="md:hidden" type="button" onClick={() => show.value = !show.value}>
						<Menu height="1.5rem" />
					</button>
					<nav w:w="full md:3/4" w:m="<md:t-2">
						<ul
							w:flex="~"
							w:justify="around"
							w:children="border-b-2 transition-transform transform duration-100"
						>
							<li w:transform="hover:scale-110">
								<a href="/#about">{header.about}</a>
							</li>
							<li w:transform="hover:scale-110">
								<a href="/t">{header.notice}</a>
							</li>
							<li w:text="gray-400">
								<a href="#">{header.forum}</a>
							</li>
							<li w:text="gray-400">
								<a href="#">{header.login}</a>
							</li>
						</ul>
					</nav>
				</div>
			)

			ret.push(
				<div
					w:p="t-4"
					w:grid="~ cols-[4fr,1fr] rows-1"
				>
					<article class="prose mx-auto">
						{slots.default ? slots.default() : null}
					</article>
					<aside class="sticky bg-gray-50 overflow-y-auto text-sm px-3 
								rounded-md mb-4 p-4 max-w-sm w-full mx-auto"
					style="top: 90px; bottom: 0px; right:0px">
						<span># Document Menu </span>
						<MdMenu toc={{}} />
					</aside>
				</div>
			)

			ret.push(
				<div
					w:bg="gray-800"
					w:h="min-20"
					w:text="white"
					w:flex="~"
					w:align="items-center"
					w:justify="center"
					ref={el_footer}
				>
					<p>By &copy; 2021 I/O club All rights reserved</p>
				</div>
			)

			return ret
		}
	},
})
