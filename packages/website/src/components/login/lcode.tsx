import { customAlphabet, nanoid } from 'nanoid'
import { $fetch } from 'ohmyfetch'
import {createStorage} from 'unstorage'
import localStorageDriver from 'unstorage/drivers/localstorage'
import IPhone from 'virtual:icons/flat-color-icons/iphone'
import { defineComponent } from 'vue'
import {useRoute} from 'vue-router'

import NButton from '~/components/login/nbutton'
import Input from '~/components/login/ninput'
import { useI18n } from '~/plugins/i18n'

export default defineComponent({
	setup() {
		const { i18n } = useI18n()
		const { emailorphone, sixinput, button } = i18n.value.login
		const input = {
			field: '',
			sixinput: '      ',
			buttonvalue: button.login,
		}
		const route = useRoute()
		const storage = createStorage({
			driver: process.client ? localStorageDriver({ base: 'app:' }) : undefined,
		})
		const customed_nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 80)
		return () => {
			return <div
				w:flex="~ col"
				w:w="full"
				w:align="items-center"
				w:justify="around"
			>
				<Input 
					value={input.field} 
					type="text" 
					label={emailorphone.label}
					msg={emailorphone.msg}
					placeholder={emailorphone.placeholder}
					onChange={(e) => input.field}
				>
					{{
						icon: () => <IPhone/>,
						rightbutton: () => <button w:w='20' 
							w:outline="none focus:(none)"
							w:border="~ l-green-400 r-0 t-0 b-0"
							w:p='l-2'
							onClick={async () => {
								const phoneReg = /^[1][3,5,7,8][0-9]{9}$/;
								const emailReg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
								if(phoneReg.test(input.field)){    //发请求时先正则检验下手机号
									console.log('用户输入的是手机号');
									const res = await $fetch('/api/user/login_begin', {
										method: 'POST',
										body: {
											type: 'phone',
											phone: input.field,
										}
									})
									console.log(res);
								}
								else if (emailReg.test(input.field)) {
									console.log('用户输入的是邮箱');
									const res = await $fetch('/api/user/login_begin', {
										method: 'POST',
										body: {
											type: 'email',
											email: input.field,
										}
									})
									console.log(res);
									
								}
								else {
									console.log('请检查输入的邮箱或手机号');
								}
								
							}}
						>{button.sendcode}</button>
					}}
				</Input>

				<Input
					value={input.sixinput}
					msg={sixinput.msg}
					label={sixinput.label}
					class="tracking-2.5em"
					w:bg="digit sz-digit repeat-x bottom"
					onChange={(e) => input.sixinput = e}
				/>

				<NButton p="1 x-20" type="button" 
					value={input.buttonvalue}
					onClick={async () => {
						console.log('按下登录按钮');
						const state = nanoid()
						const code_challenge = customed_nanoid()
						// await storage.setItem('code_challenge', code_challenge)

					}}
				/>
			</div>
		}
	},
})


