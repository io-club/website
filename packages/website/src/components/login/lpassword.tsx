import {customAlphabet, nanoid} from 'nanoid'
import {$fetch} from 'ohmyfetch'
import queryString from 'query-string'
import {createStorage} from 'unstorage'
import localStorageDriver from 'unstorage/drivers/localstorage'
import NLoadingCirclr from 'virtual:icons/eos-icons/loading'
import IAlien from 'virtual:icons/mdi/alien-outline'
import IPassword from 'virtual:icons/ri/lock-password-line'
import {defineComponent, reactive} from 'vue'
import {useRoute} from 'vue-router'

import NButton from '~/components/login/nbutton'
import NInput from '~/components/login/ninput'
import {useI18n} from '~/plugins/i18n'

enum LoginState {
	Idle,
	FromClient,
	FromSelf,
	SelfCode,
	ClientCode,
	SelfToken,
	ClientToken
}

export default defineComponent({
	setup() {
		const {i18n} = useI18n()
		const input = reactive({
			username: '',
			passwd: ''
		})
		const route = useRoute()
		const storage = createStorage({
			driver: process.client ? localStorageDriver({base: 'app:'}) : undefined,
		})
		const customed_nanoid = customAlphabet('1234567890abcdef', 80)
		return () => {
			const {idoremail, passwd, button} = i18n.value.login
			let loginstate = LoginState.Idle
			if (route.query.response_type === 'code') {
				loginstate = LoginState.FromClient
			} else if (route.query.code) {
				const exchange_ff = async function () {
					const code_verifier = await storage.getItem('code_challenge')
					const res = await fetch('http://localhost:3000/api/oauth/token', {
						method: 'POST',
						body: JSON.stringify({
							grant_type: 'authorization_code',
							client_id: process.env['IO_OAUTH_WEB_ID'],
							redirect_uri: 'http://localhost:3000/login',
							code: route.query.code,
							code_verifier: code_verifier,
						})
					})
				}
				exchange_ff()
			} else {
				loginstate = LoginState.FromSelf
			}
			return <div
				w:flex="~ col"
				w:w="full"
				w:align="items-center"
				w:justify="around"
			>
				<NInput type="text"
					value={input.username}
					label={idoremail.label}
					msg={idoremail.msg}
					placeholder={idoremail.placeholder}
					onChange={(e) => {
						input.username = (e.target as HTMLInputElement).value
					}}
				>
					{{
						icon: () => <IAlien />,
					}}
				</NInput>
				<NInput type="text"
					value={input.passwd}
					label={passwd.lable}
					msg={passwd.msg}
					placeholder={passwd.placeholder}
					onChange={(e) => {
						console.log(e.target);
						input.passwd = (e.target as HTMLInputElement).value
					}}
				>
					{{
						icon: () => <IPassword />,
					}}
				</NInput>
				<div w:w='full' w:m="b-2" w:text="sm right gray-400"><span>forget password?</span></div>
				<NButton p="1 x-20"
					type="button"
					value={button.login}
					onClick={async () => {
						const state = nanoid()
						const code_challenge = customed_nanoid()
						await storage.setItem('code_challenge', code_challenge)
						const res = await $fetch('/api/user/login_begin', {
							method: 'POST',
							body: {
								type: 'passwd',
								username: input.username,
								passwd: input.passwd,
							}
						})
						if (loginstate === LoginState.FromSelf) {
							const url = queryString.stringifyUrl({
								url: '/api/oauth/authorize', query: {
									response_type: 'code',
									client_id: process.env['IO_OAUTH_WEB_ID'],
									redirect_uri: 'http://localhost:3000/login',
									state,
									code_challenge,
									code_challenge_method: 'plain'
								}
							});
							window.location.href = url
						} else {
							console.log('third part tring to get code from server');
							// const url = queryString.stringifyUrl({url: '/api/oauth/authorize', query: {
							// 	response_type: 'code',
							// 	client_id: process.env['IO_OAUTH_WEB_ID'],
							// 	redirect_uri: route.query.redirect_url,
							// 	state: route.query.state,
							// 	code_challenge: route.query.code_challenge,
							// 	code_challenge_method: 'plain'
							// }});
							// window.location.href = url
						}
					}}>
					<NLoadingCirclr />
				</NButton>
			</div>
		}
	},
})
