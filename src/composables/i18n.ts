import {buildI18n, useLanguage} from 'vue-composable'

import en from '/@/locales/en.json'
import zhCN from '/@/locales/zh_CN.json'

export const useI18n = () => {
	const i18n = buildI18n({
		locale: 'zh-CN' as const,
		fallback: 'en' as const,
		messages: {
			en: en,
			'zh-CN': zhCN,
		},
	})
	const userlocale = (i18n.locales.value as readonly string[]).indexOf(
		useLanguage().language.value
	)
	if (userlocale != -1) {
		i18n.locale.value = i18n.locales.value[userlocale];
	}
	return i18n
}

export declare type I18nType = ReturnType<typeof useI18n>
