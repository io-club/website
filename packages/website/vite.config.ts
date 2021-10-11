import {defineConfig} from 'vite'
import windi from 'vite-plugin-windicss'

export default defineConfig(async function() {
	return {
		plugins: [
			windi({}),
		],
	}
})
