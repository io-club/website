import type {Ref} from 'vue'

import {inject, provide, ref, watch} from 'vue'

export interface T extends Record<string, unknown> {
}

export interface I18nInstance<T> {
	locale: Ref<string>
	i18n: Ref<T>
}

export interface I18nOptions<T> {
	locale: string
	messages: Record<string, T | (() => T) | (() => Promise<T>)>,
}

export function setI18n(opts: I18nOptions<T>, prov?: (name: string, value: unknown) => void) {
	const locale = ref(opts.locale)
	const i18n = ref(null) as unknown as Ref<T>
	const messages: Record<string, T> = {}
	const generate = async function (e: string) {
		if (messages[e]) {
			i18n.value = messages[e]
			return
		}
		const v = opts.messages[e]
		if (v) {
			if (typeof v === 'function') {
				const file = await v()
				messages[e] = (file.default ? file.default : file) as T
			} else {
				messages[e] = v
			}
		}
		if (messages[e]) {
			i18n.value = messages[e]
			return
		}
		console.warn(`can not find locale ${e}`)
	}
	generate(locale.value)
	watch(locale, generate)
	const inst: I18nInstance<T> = {
		locale,
		i18n,
	}
	if (prov) prov('__i18n', inst)
	else provide('__i18n', inst)
	return inst
}

export function useI18n() {
	return inject('__i18n') as I18nInstance<T>
}
