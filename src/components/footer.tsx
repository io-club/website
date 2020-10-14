import {defineComponent, inject, reactive, ref} from 'vue'
import {useBreakpoint, useFetch} from 'vue-composable'

import BreakpointsConfig from '/@/breakpoints.json'
import Logo from '/@/components/logo.tsx'

declare interface Hitokoto {
	word?: string;
	from?: string;
	uuid?: string;
}

export default defineComponent({
	setup() {
		const {locale, $ts: t} = inject('i18n') || {}
		const sm = ref(useBreakpoint(BreakpointsConfig).sm)
		const hitokoto: Hitokoto = reactive({})

		const {exec} = useFetch()
		exec('//v1.hitokoto.cn?encode=json&charset=utf-8&max_length=16').then(res => res?.json()).then(data => {
			hitokoto.word = data?.hitokoto?.replace('。', '').replace('.', '')
			hitokoto.from = data?.from
			hitokoto.uuid = data?.uuid
		})

		return () => {
			const extra: JSX.Element[] = []

			if (sm.value) {
				extra.push(<span>{t('language: {0}', [t(locale.value)])}</span>)
				extra.push(<a class="flex-grow text-center"
					href={hitokoto.uuid ? `//hitokoto.cn?uuid=${hitokoto.uuid}` : '/#'}>
					{hitokoto.word} {hitokoto.uuid ? '-' : ''}  {hitokoto.from}
				</a>)
			}

			return <footer class="itms-center justify-center w-full px-6 py-3 mt-6">
				<div class="flex flex-row flex-center w-4/5 mx-auto">
					{extra}
					<div class="flex flex-row items-center children:mr-1">
						<div class="flex flex-col flex-center">
							<span> @{new Date().getFullYear()} </span>
							<span> {t('IO LAB')} </span>
						</div>
						<Logo class="w-10 h-10" />
					</div>
				</div>
			</footer>
		}
	}
})
