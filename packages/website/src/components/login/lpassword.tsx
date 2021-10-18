
import { useI18n } from '@ioclub/composable'
import { fetch } from 'ohmyfetch'
import IAlien from 'virtual:icons/mdi/alien-outline'
import IPassword from 'virtual:icons/ri/lock-password-line'
import { defineComponent, ref } from 'vue'

import NButton from '~/components/login/nbutton'
import NInput from '~/components/login/ninput'
export default defineComponent({
	props: {

	},
	setup(props) {
		const { i18n } = useI18n()
		const username = ref('')
		const password = ref('')

		// toastify-js
		return () => {

			return <div
				w:flex="~ col"
				w:w="full"
				w:align="items-center"
				w:justify="around"
			>
				<NInput type="text" 
					value={username.value}
					label="Username / Email" 
					msg="请填写用户名 / 邮箱" 
					placeholder="Type your username or email"
					onChange={(e) => {
						username.value = e.target.value
					}}
				>
					{{ 
						icon: () => <IAlien/>,
					}}
				</NInput>
				<NInput type="text" 
					value={password.value}
					label="Password" 
					msg="请填写密码" 
					placeholder="Type your password" 
					onChange={(e) => {
						password.value = e.target.value
					}}
				>
					{{ 
						icon: () => <IPassword/>,
					}}
				</NInput>
				<div w:w='full' w:m="b-2" w:text="sm right gray-400"><span>forget password?</span></div>
				<NButton p="1 x-20" type="button" value={i18n.value.login} 
					onClick={() => {
						const user_info = {
							username: username.value ? username.value.getValue() : '',
							password: password.value ? password.value.getValue() : ''
						}
						console.log(user_info);
					}}/>
			</div>
		}
	},
})


