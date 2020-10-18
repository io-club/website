import {VueComponent as MdiDown} from '@mdi/svg/svg/chevron-down.svg'
import {VueComponent as MdiClose} from '@mdi/svg/svg/close.svg'
import {VueComponent as MdiMenu} from '@mdi/svg/svg/menu.svg'
import {defineComponent, inject, reactive, ref, withModifiers} from 'vue'
import {computed} from 'vue'
import {useBreakpoint} from 'vue-composable'
import {useRouter} from 'vue-router'

import BreakpointsConfig from '/@/breakpoints.json'
import Logo from '/@/components/logo'

export default defineComponent({
	setup() {
		const {locale, locales, $ts: t} = inject('i18n') || {}

		const router = useRouter()

		const sm = ref(useBreakpoint(BreakpointsConfig).sm)

		const menuConfig = computed(() => {
			return [
				{
					text: '',
					link: '',
					icon: '',
				},
				{
					text: 'home',
					link: '/#',
				},
				{
					text: 'class',
					link: '/posts/class',
				},
				{
					text: 'pyterm',
					link: '/pyterm',
				},
				{
					text: 'about',
					link: '/posts/about',
				},
				{
					text: 'languages',
					link: '#',
					dropdown: locales.value.map((t: string) => {
						return {
							text: t,
							link: t,
							locale: true,
							clickToggleMenu: true,
						};
					}),
				},
			];
		})

		const open = ref(false)

		const focus: Record<string, boolean> = reactive({})

		return () => {
			// hidden on small
			const brand_text = sm.value &&
				<span class="text-lg uppercase tracking-widest">
					{t('IO LAB')}
				</span>

			// the brand
			const brand =
				<button class="
flex flex-row items-center flex-shrink-0
font-semibold
children:mx-1
focus:outline-none
"
					onClick={() => router.push('/#')}>
					<Logo class="w-8 h-8" />
					{brand_text}
				</button>

			// burger for small
			const burger = !sm.value &&
				<button class="focus:outline-none" onClick={withModifiers(() => open.value = !open.value, ['stop', 'prevent'])} >
					{open.value ? <MdiClose class="w-6 h-6" /> : <MdiMenu class="w-6 h-6" />}
				</button>

			// build the menu items
			const items: JSX.Element[] = []
			for (const item of menuConfig.value) {
				let m: JSX.Element[] = []

				const focused = focus[item.text]

				if (item.text) {
					m.push(<span>{t(item.text)}</span>)
				} else {
					continue
				}

				if (item.dropdown) {
					m.push(<MdiDown class={`w-6 h-6
transform transition-transform duration-100
${focused ? 'rotate-180' : ''}`} />)
				}

				m = [<div class="
py-1 px-2 rounded
flex flex-row items-center flex-wrap
enter:bg-bb enter:text-fa
">{m}</div>]

				items.push(<button class={`
focus:outline-none mx-2
${!sm.value ? 'w-full text-left my-1' : ''}
`}
					onClick={withModifiers(() => {
						router.push(item.link)
						focus[item.text] = !focus[item.text]
					}, ['stop', 'prevent'])}>
					{m}
				</button>)

				if (item.dropdown && focused) {
					const dropdown: JSX.Element[] = []
					for (const d of item.dropdown) {
						dropdown.push(<button class="mx-1 p-2
focus:outline-none text-left
enter:bg-bb enter:text-fa"
							onClick={withModifiers(() => {
								if (d.locale) {
									locale.value = d.link
								} else {
									router.push(d.link)
								}
								if (d.clickToggleMenu) {
									focus[item.text] = !focus[item.text]
								}
							}, ['stop', 'prevent'])}>{t(d.text)}</button>)
					}
					items.push(<div class={`
flex flex-col my-1
animate-easein animate-150
${sm.value ? 'p-2 bg-ba border-2 border-ba' : ''}
${sm.value ? 'absolute top-8 min-w-20 max-w-screen-sm' : ''}
${sm.value ? 'right-0 origin-top-right' : 'left-0 origin-top-left ml-2'}`}>{dropdown}</div>)
				}
			}

			// build the menu
			const menu = (sm.value || open.value) &&
				<nav class={`
flex justify-end bg-ba
${!sm.value ? 'flex-col items-left' : 'flex-row items-center'}
${!sm.value ? 'animate-easein animate-100 w-full py-2' : 'relative'}
`}>
					{items}
				</nav>

			return <header class={`
bg-ba text-fb shadow
w-full py-2
sticky top-0 z-50
`}>
				<div class="flex flex-row flex-wrap flex-between w-4/5 mx-auto">
					{brand}
					{burger}
					{menu}
				</div>
			</header>
		}
	}
})
