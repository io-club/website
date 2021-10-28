import 'toastify-js/src/toastify.css'

import {customAlphabet, nanoid} from 'nanoid'
import { $fetch } from 'ohmyfetch'
import queryString from 'query-string'
import Toastify from 'toastify-js'
import ILArrow from 'virtual:icons/mdi/arrow-left'
import { defineComponent, reactive, ref} from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useNuxtApp } from '#app'
import Link from '~/components/link'
import NButton from '~/components/login/button'
import Ninput from '~/components/login/input'
import { useI18n} from '~/plugins/i18n'
import toast from '~/utils/toast'
export default defineComponent({
	setup() {
		const route = useRoute()
		const router = useRouter()
		const { i18n } = useI18n()
		const alnon = /^[a-zA-Z0-9_]*$/
		const customed_nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 80)
		const passwd = ref('')
		const { login } = i18n.value
		const storage = useNuxtApp().$__storage
		return () => {
			return <div
				w:flex='~ grow'
				w:justify='center'
				w:align='items-center'
				w:h='full'
				w:p='8'
				w:border='1'
			>
				<div
					w:w='100'
					w:p='8'
					w:align='items-center'
					w:border='1 '
				>
					<NButton
						icon={<ILArrow/>}
						value={route.query.username?.toString()}
						onClick={() => router.push('/login')}
					/>
					<div w:m='t-2' w:text='2xl true-gray-900' w:font='medium'>{login.title.inputpasswd}</div>
					<Ninput placeholder={login.placeholder.passwd} value={passwd.value} onChange={e => passwd.value = e}/>
					<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
						{login.problem.forgetpasswd} <Link to='/login/nopasswd'>{login.loginway.change}</Link>
					</div>
					<div w:m='t-4' w:text='right'>
						<button
							w:text='true-gray-50'
							w:bg='gray-700'
							w:p='x-5 y-2'
							w:transform='~ active:(scale-90)'
							onClick={async () => {
								if (route.query.username && alnon.test(route.query.username.toString())) {
									const res = await $fetch('/api/user/login/password', {
										method: 'POST',
										body: {
											type: 'password',
											password: passwd.value,
										}
									})
									// const state = nanoid()
									// const code_challenge = customed_nanoid()
									// try {
									// 	await storage.setItem('code_challenge', code_challenge)
									// 	const res = await $fetch('/api/user/login_begin', {
									// 		method: 'POST',
									// 		body: {
									// 			type: 'passwd',
									// 			username: route.query.username.toString(),
									// 			passwd: passwd.value,
									// 		}
									// 	})
									// } catch(e)  {
									// 	toast(login.errormsg.loginerror)
									// 	return
									// }
									// const redirect_uri = queryString.stringifyUrl({url: 'http://localhost:3000/login/logincomplete', query: {
									// 	from: route.query.from
									// }});
									// console.log(redirect_uri);

									// const url = queryString.stringifyUrl({
									// 	url: '/api/oauth/authorize', query: {
									// 		response_type: 'code',
									// 		client_id: process.env['IO_OAUTH_WEB_ID'],
									// 		redirect_uri: redirect_uri,
									// 		state,
									// 		code_challenge,
									// 		code_challenge_method: 'plain'
									// 	}
									// });
									// window.location.href = url
								}
							}}>{login.nextstep.nextstep}</button>
					</div>

				</div>
			</div>
		}
	}
})
