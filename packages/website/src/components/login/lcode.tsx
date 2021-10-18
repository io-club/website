
import { useI18n } from '@ioclub/composable'
import IPhone from 'virtual:icons/flat-color-icons/iphone'
import { defineComponent, ref } from 'vue'

import NButton from '~/components/login/nbutton'
import NInput from '~/components/login/ninput'
import NSixinput from '~/components/login/nsixinput'
export default defineComponent({
	props: {

	},
	setup(props) {
		const { i18n } = useI18n()
		const phone = ref('')
		const varifycode = ref('')
		// toastify-js
		return () => {
			return <div
				w:flex="~ col"
				w:w="full"
				w:align="items-center"
				w:justify="around"
			>
				<NInput 
					ref={phone} 
					type="number" 
					label="Phone" 
					msg="请填写手机号" 
					placeholder="Type your phone"
				>
					{{
						icon: () => <IPhone/>,
						rightbutton: () => <button w:w='20' 
							w:outline="none focus:(none)"
							w:border="~ l-green-400 r-0 t-0 b-0"
							w:p='l-2'
						>获取验证码</button>
					}}
				</NInput>

				<NSixinput 
					ref={varifycode.value}
					msg="required"
					label="Verification"
				></NSixinput>

				<NButton p="1 x-20" type="button" value={i18n.value.login}
					onClick={() => {
						console.log(varifycode.value);
						console.log(phone.value);
					}}
				/>
			</div>
		}
	},
})


