import {createStorage} from 'unstorage'
import localStorageDriver from 'unstorage/drivers/localstorage'

import { defineNuxtPlugin, useState } from '#app'
export default defineNuxtPlugin((nuxt) => {
	const storage = createStorage({
		driver: process.client ? localStorageDriver({ base: 'app:' }) : undefined,
	})
    
	const locale = useState(
		storage,
		() => nuxt.ssrContext.req.headers['accept-language']?.split(',')[0]
	)
	// console.log(Object.entries(nuxt.ssrContext ?? {}).filter(([k]) => !['req',  'nuxt'].includes(k)));
})
