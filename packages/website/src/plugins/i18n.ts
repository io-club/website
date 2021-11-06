import type s from '@/locales/zh_CN'
import type { NuxtApp, Plugin } from '#app'
import type {Ref} from 'vue'

import { inject, watch } from 'vue'

import zh_CN from '@/locales/zh_CN'
import { useState } from '#app'

type json = typeof s
export interface T extends json {
}

export interface I18nInstance<T> {
	locale: Ref<string>
	i18n: Ref<T>
}

export interface I18nOptions<T> {
	locale?: string
	messages: Record<string, T | string>,
}

async function setI18n(opts: I18nOptions<T>, nuxt: NuxtApp) {
	if (Object.keys(opts.messages).length == 0) {
		throw new Error('should provide at least one locale')
	}
	const locale = useState(
		'__i18n_locale',
		() => opts.locale ?? nuxt.ssrContext?.req.headers['accept-language']?.split(',')[0] ?? 'en',
	)
	const i18n = useState<T>('__i18n_value')
	const messages: Record<string, T> = {}
	const generate = async function (e: string) {
		if (messages[e]) {
			i18n.value = messages[e]
			return
		}
		const v = opts.messages[e]
		if (v) {
			if (typeof v === 'string') {
				const file = await import(/* @vite-ignore */ v)
				messages[e] = (file.default ? file.default : file) as T
			} else {
				messages[e] = v
			}
		}
		if (messages[e]) {
			i18n.value = messages[e]
			return
		}

		// fallback to the default
		i18n.value = Object.values(messages)[0]
		if (!i18n.value) {
			const [k, v] = Object.entries(opts.messages)[0]
			if (typeof v === 'string') {
				const file = await import(/* @vite-ignore */ v)
				messages[k] = (file.default ? file.default : file) as T
			} else {
				messages[k] = v
			}
			i18n.value = v
		}
	}
	await generate(locale.value)
	watch(locale, generate)
	const inst: I18nInstance<T> = {
		locale,
		i18n,
	}
	nuxt.provide('__i18n', inst)
	return inst
}

export function useI18n() {
	return inject('__i18n') as I18nInstance<T>
}

const plugin: Plugin = async function (app) {
	await setI18n({
		messages: {
			'zh-CN': zh_CN,
		},
	}, app)
	return
}
export default plugin
