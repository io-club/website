import 'katex/dist/katex.min.css'
import 'highlight.js/scss/monokai-sublime.scss'
import './posts.styl'

import {defineComponent, h, inject, onBeforeUpdate, ref} from 'vue'
import {useBreakpoint} from 'vue-composable'
import {RouterView} from 'vue-router'

import BreakpointsConfig from '/@/breakpoints.json'
import License from '/@/components/cc'
import Loading from '/@/components/loading'
import {TocEntry} from '/@/components/toc'

export default defineComponent({
	setup() {
		const {$ts: t} = inject('i18n') || {}
		const toc = ref({} as TocEntry);
		const attributes = ref({} as Record<string, unknown>);
		const sm = ref(useBreakpoint(BreakpointsConfig).sm)
		const mounted = ref(false)

		return () => {
			const hidden = mounted.value ? '' : 'hidden'
			return <section class={`flex flex-col flex-center flex-grow ${!sm.value ? 'px-2' : (attributes.value.toc ? 'ml-64' : '')}`}>
				{!mounted.value ? <Loading /> : ''}
				<section class={`my-16 flex flex-col flex-center ${hidden}`}>
					<h1>{attributes.value.title || t('untitled')}</h1>
					<h4>{attributes.value.desc}</h4>
					<License license={attributes.value.license} />
				</section>
				<section class={`flex flex-row flex-wrap flex-grow justify-center ${hidden} ${!sm.value ? 'w-full' : 'w-4/5'} bg-ba shadow`}>
					{h(RouterView, {
						class: `flex-grow ${!sm.value ? 'px-4 py-8' : 'p-8'} ${hidden} markdown`,
						'onUpdate:toc': (e: TocEntry) => toc.value = e,
						'onUpdate:attributes': (e: Record<string, unknown>) => attributes.value = e,
						'onUpdate:mounted': (e: boolean) => mounted.value = e,
					})}
				</section>
			</section>
		}
	}
})
