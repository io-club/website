import {VueComponent as FileCode} from '@mdi/svg/svg/file-code.svg'
import {VueComponent as FAQ} from '@mdi/svg/svg/frequently-asked-questions.svg'
import {VueComponent as HammerWrench} from '@mdi/svg/svg/hammer-wrench.svg'
import {VueComponent as Memory} from '@mdi/svg/svg/memory.svg'
import {defineComponent, inject} from 'vue'

import Beer from '/@/components/beer'

export default defineComponent({
	setup() {
		const {$ts: t} = inject('i18n') || {}
		return () => {
			const elements = [
				{
					img: <Beer class="w-36 h-36" />,
					hero: [
						<span>{t('home_sec1_hero')}</span>,
						<span class="animate-blink">_</span>,
					],
					sub: t('home_sec1_sub'),
				},
				{
					img: <HammerWrench class="w-40 h-40" />,
					hero: t('home_sec2_hero'),
					sub: t('home_sec2_sub'),
				},
				{
					img: <FileCode class="w-40 h-40" />,
					hero: t('home_sec3_hero'),
					sub: t('home_sec3_sub'),
				},
				{
					img: <Memory class="w-40 h-40" />,
					hero: t('home_sec4_hero'),
					sub: t('home_sec4_sub'),
				},
				{
					img: <FAQ class="w-40 h-40" />,
					hero: t('home_sec5_hero'),
					sub: [
						t('home_sec5_sub'),
						<a href="/posts/about" >{t('about')}</a>,
						'.',
					],
				},
			]
			const sections: JSX.Element[] = []
			let even = true
			for (const e of elements) {
				sections.push(<section class={`flex flex-center flex-wrap w-full p-8 children:mx-8 ${even ? 'flex-row bg-bb text-fc' : 'flex-row-reverse bg-fd text-bb'}`}>
					{e.img}
					<div class="flex flex-col flex-center max-w-36">
						<p class="my-1 text-3xl font-bold">
							{e.hero}
						</p>
						<p class="text-xl font-semibold">
							{e.sub}
						</p>
					</div>
				</section>)
				even = !even
			}
			return <section class="flex flex-col items-center">
				{sections}
			</section >
		}
	}
})
