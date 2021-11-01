import type {Storage} from 'unstorage'

import {createStorage} from 'unstorage'
import localStorageDriver from 'unstorage/drivers/localstorage'

import { defineNuxtPlugin } from '#app'
const astorage = createStorage({
	driver: process.client ? localStorageDriver({base: 'app:'}) : undefined,
})

export default defineNuxtPlugin(async nuxtApp => {
	nuxtApp.provide('__storage', astorage);
})

declare module '#app' {
	interface NuxtApp {
		$__storage: Storage
	}
}
