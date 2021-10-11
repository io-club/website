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

		return () => {
			const {header, title} = i18n.value.common
			const ret = []

			ret.push(
				<div
					w:p="y-3 x-oi-6 x-os-5 x-o"
					w:h="14"
					w:bg="white"
					w:flex="~ wrap"
					w:justify="between"
					w:align="items-center"
					w:pos="sticky top-0"
				>
					<Link w:flex="~" w:align="items-center" to="/" >{() => [
						<Logo w:text="2xl" />,
						<span w:text="2xl" w:font="heavy">{title}</span>,
					]}</Link>
					<button w:display="md:hidden" type="button" onClick={() => show.value = !show.value}>
						<Menu w:text="2xl" />
					</button>
					<nav w:w="full md:3/4" w:m="<md:t-2">
						<ul
							w:flex="~"
							w:justify="around"
							w:children="border-b-2 transition-transform transform duration-100"
						>
							<li w:transform="hover:scale-110">
								<Link to="/#about">{() => header.about}</Link>
							</li>
							<li w:transform="hover:scale-110">
								<Link to="/t">{() => header.notice}</Link>
							</li>
							<li w:text="gray-400">
								<Link to="#">{() => header.forum}</Link>
							</li>
							<li w:text="gray-400">
								<Link to="#">{() => header.login}</Link>
							</li>
						</ul>
					</nav>
				</div>
			)

			ret.push(
				<div
					w:p="t-4"
					w:grid="~ cols-[4fr_1fr] rows-1"
				>
					<article class="prose mx-auto">
						{slots.default ? slots.default() : null}
					</article>
					<aside>
						<div w:pos="sticky top-14">
							<span># Document Menu </span>
							<MdMenu toc={{}} />
						</div>
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
				>
					<p>By &copy; 2021 I/O club All rights reserved</p>
				</div>
			)

			return ret
		}
	},
})
