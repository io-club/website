import { $fetch } from 'ohmyfetch'
import { defineComponent, reactive, ref} from 'vue'
import { useRoute,useRouter } from 'vue-router'

import { useNuxtApp } from '#app'
export default defineComponent({
	setup() {
		const router = useRouter()
		const route = useRoute()
		const storage = useNuxtApp().$__storage
		const exchange_ff = async function () {
			const code_verifier = await storage.getItem('code_challenge')
			try {
				console.log({
					grant_type: 'authorization_code',
					client_id: process.env['IO_OAUTH_WEB_ID'],
					redirect_uri: 'http://localhost:3000/login/logincomplete',
					code: route.query.code,
					code_verifier: code_verifier,
				});

				const res = await $fetch('http://localhost:3000/api/oauth/token', {
					method: 'POST',
					body:{
						grant_type: 'authorization_code',
						client_id: process.env['IO_OAUTH_WEB_ID'],
						redirect_uri: 'http://localhost:3000/login/logincomplete',
						code: route.query.code,
						code_verifier: code_verifier,
					}
				})
				console.log(await res.text());
			} catch(e) {
				console.log(e, e.data);
			}
		}
		exchange_ff()

		return () => {
			return <div
				w:flex='~ grow'
				w:justify='center'
				w:align='items-center'
				w:h='full'
				w:p='8'
				w:border='1 rounded'
			>
				<div
					w:w='100'
					w:p='8'
					w:align='items-center'
					w:border='1 '
				>
					你已经登录了, 别看了!!!
				</div>
			</div>
		}
	}
})
