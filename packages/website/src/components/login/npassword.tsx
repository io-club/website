
import { useI18n } from '@ioclub/composable'
import Alien from 'virtual:icons/mdi/alien-outline'
import IPassword from 'virtual:icons/ri/lock-password-line'
import { defineComponent, ref } from 'vue'

import NButton from '~/components/login/nbutton'
import NInput from '~/components/login/ninput'

export default defineComponent({
	props: {

	},
	setup(props) {
		const { i18n } = useI18n()
		const username = ref(null)

		watchEffect(() => {
			console.log(username.value)
		})
		const updateValue = (value) => {
			username.value = value
		}
		provide('updateValue', updateValue)
		// toastify-js
		return () => {
			return <div
				w:flex="~ col"
				w:w="100"
				w:align="items-center"
				w:justify="around"
			>
				<span w:text="2xl stroke-1">Login</span>
				<NInput type="text" required={true} label="Username" msg="请填写用户名" placeholder="Type your username"><Alien/></NInput>
				<NInput type="text" required={true} label="Password" msg="请填写密码" placeholder="Type your password" ><IPassword/></NInput>
				<div w:m="b-2" w:text="sm right gray-400"><span>forget password?</span></div>
				<NButton p="1 x-20" type="button" value={i18n.value.login} />
			</div>
		}
	},
})


