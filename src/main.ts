import '@purge-icons/generated'
import {createApp} from 'vue';
import {createRouter, createWebHistory} from 'vue-router';
import {createI18n} from 'vue-i18n'
import routes from 'voie-pages';
import main from './main.vue';
import {messages} from './locales'

const app = createApp(main)

const router = createRouter({
	history: createWebHistory(),
	routes,
});

app.use(router);

const userLang = window?.navigator.language;
const i18n = createI18n({
	locale: userLang ? userLang : '',
	fallbackLocale: 'en',
	fallbackWarn: false,
	missingWarn: false,
	messages,
})

app.use(i18n)

app.mount('#app');
