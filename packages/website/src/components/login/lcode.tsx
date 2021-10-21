import { useI18n } from '@ioclub/composable'
import { method } from 'lodash'
import IPhone from 'virtual:icons/flat-color-icons/iphone'
import { defineComponent, ref } from 'vue'

import NButton from '~/components/login/nbutton'
import NInput from '~/components/login/ninput'
import NSixinput from '~/components/login/nsixinput'
export default defineComponent({
	setup() {
		const { i18n } = useI18n()
		const input = {
			field: '',
			sixinput: ['', '', '', '', '', '']
		}
		// toastify-js
		return () => {
			return <div
				w:flex="~ col"
				w:w="full"
				w:align="items-center"
				w:justify="around"
			>
				<NInput 
					value={input.field} 
					type="text" 
					label="Email / Phone" 
					msg="请填写邮箱 / 手机号" 
					placeholder="Type your email / phone"
					onChange={(e) => {
						input.field = e.target.value
					}}
				>
					{{
						icon: () => <IPhone/>,
						rightbutton: () => <button w:w='20' 
							w:outline="none focus:(none)"
							w:border="~ l-green-400 r-0 t-0 b-0"
							w:p='l-2'
							onClick={async () => {
								const res = await $fetch('/api/user/login_begin', {
									method: 'POST',
									body: {
										type: 'email',
										email: input.field,
									}
								})
							}}
						>获取验证码</button>
					}}
				</NInput>

				<NSixinput
					value={input.sixinput}
					msg='请填写验证码'
					label='Varifization code'
					onChange={(e) => {
						input.sixinput[e.target.id] = e.target.value
					}}
				></NSixinput>

				<NButton p="1 x-20" type="button" value={i18n.value.login}
					onClick={() => {
					}}
				/>
			</div>
		}
	},
})


