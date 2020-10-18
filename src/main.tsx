import 'tailwindcss/base.css'
import './main.styl'
import 'tailwindcss/components.css'
import 'tailwindcss/utilities.css'

import routes from 'voie-pages';
import {createApp, defineComponent, provide} from 'vue';
import {buildI18n, useLanguage} from 'vue-composable';
import {createRouter, createWebHistory, RouterView} from 'vue-router';

import Footer from '/@/components/footer'
import Header from '/@/components/header'

const main = defineComponent({
	setup() {
		// inject i18n
		const i18n = buildI18n({
			locale: 'zh-CN',
			fallback: 'en',
			messages: {
				en: async () => {
					const m = await import('/@/locales/en.json');
					return m.default;
				},
				'zh-CN': async () => {
					const m = await import('/@/locales/zh_CN.json');
					return m.default;
				},
			},
		});
		const userlocale = (i18n.locales.value as readonly string[]).indexOf(
			useLanguage().language.value
		);
		if (userlocale != -1) {
			i18n.locale.value = i18n.locales.value[userlocale];
		}
		provide('i18n', i18n)

		return () => {
			return <div class="flex flex-col
w-full min-h-screen
bg-bb fill-current
text-base text-txt font-normal">
				<Header />
				<RouterView />
				<Footer />
			</div>
		}
	}
})

const app = createApp(main)

app.use(createRouter({
	history: createWebHistory(),
	routes,
}));

app.mount('#app');
