
import { useI18n } from '@ioclub/composable'
import {createHash} from 'crypto'
import { customAlphabet, nanoid } from 'nanoid'
import { $fetch } from 'ohmyfetch'
import queryString from 'query-string' 
import IAlien from 'virtual:icons/mdi/alien-outline'
import IPassword from 'virtual:icons/ri/lock-password-line'
import { defineComponent, reactive} from 'vue'

import { defineNuxtPlugin, useState } from '#app'
import NButton from '~/components/login/nbutton'
import NInput from '~/components/login/ninput'
export default defineComponent({

	setup() {
		const { i18n } = useI18n()
		const input = reactive ({
			username: '',
			passwd: ''
		})
		const storage = useState('storage')
		storage.value = 'ready for new token'
		console.log(1, storage);
		
		// toastify-js
		return () => {
			return <div
				w:flex="~ col"
				w:w="full"
				w:align="items-center"
				w:justify="around"
			>
				<NInput type="text" 
					value={input.username}
					label="Username / Email" 
					msg="请填写用户名 / 邮箱" 
					placeholder="Type your username or email"
					onChange={(e) => {
						input.username = e.target.value
					}}
				>
					{{ 
						icon: () => <IAlien/>,
					}}
				</NInput>
				<NInput type="text" 
					value={input.passwd}
					label="Password" 
					msg="请填写密码" 
					placeholder="Type your password" 
					onChange={(e) => {
						input.passwd = e.target.value
					}}
				>
					{{ 
						icon: () => <IPassword/>,
					}}
				</NInput>
				<div w:w='full' w:m="b-2" w:text="sm right gray-400"><span>forget password?</span></div>
				<NButton p="1 x-20" type="button" value={i18n.value.login} 
					onClick={async () => {
						
						const state = nanoid()
						const code_challenge = nanoid()

						// const code_verifier = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 43)
						// const verifier = code_verifier()
						
						const {res} = $fetch('/api/oauth/authorize', {
							params: {
								response_type: ['code'],
								client_id: 'test',
								redirect_uri: 'http://localhost:3000/login',
								state,
								code_challenge,
								code_challenge_method: ['plain']
							}
						})
					}}/>
			</div>
		}
	},
})