import { $fetch } from 'ohmyfetch'
import IAlien from 'virtual:icons/mdi/alien-outline'
import IEmail from 'virtual:icons/mdi/email'
import IPassword from 'virtual:icons/ri/lock-password-line'
import IKey from 'virtual:icons/wpf/password1'
import { defineComponent, reactive,ref } from 'vue'

import Link from '~/components/link'
import NButton from '~/components/login/nbutton'
import NInput from '~/components/login/ninput'
import NSixinput from '~/components/login/nsixinput'
import { useI18n } from '~/plugins/i18n'
export default defineComponent({

	setup() {
		const {i18n} = useI18n()
		const input = reactive({
			username: '',
			password: '',
			password2: '',
			email: '',
			sixinput: ['', '', '', '', '', ''],
		})

		return () => {
			const {button, id, email, passwd, ensurepasswd, sixinput} = i18n.value.login
			return <div
				w:w="100"
				w:m="20"
				w:p="8"
				w:border="1 rounded"
				w:children='mt-4'
			>
				<div w:text="center"><span w:text="2xl stroke-1">Register</span></div>

				<div
					w:flex="~ col"
					w:w="full"
					w:align="items-center"
					w:justify="around"
				>
					<NInput type="text" 
						value={input.username}
						label={id.label} 
						msg={id.msg} 
						placeholder={id.placeholder}
						onChange={(e) => {
							input.username = (e.target as HTMLInputElement).value
						}}
					>
						{{
							icon: () => <IAlien/>
						}}
					</NInput>

					<NInput type="text"
						value={input.password}
						label={passwd.lable}
						msg={passwd.msg}
						placeholder={passwd.placeholder} 
						onChange={(e) => {
							input.password = (e.target as HTMLInputElement).value
						}}
					>
						{{
							icon: () => <IPassword/>
						}}
					</NInput>

					<NInput type="text" 
						value={input.password2}
						label={ensurepasswd.lable} 
						msg={ensurepasswd.msg}
						placeholder={ensurepasswd.placeholder} 
						onChange={(e) => {
							input.password2 = (e.target as HTMLInputElement).value
						}}
					>
						{{
							icon: () => <IKey/>
						}}
					</NInput>

					<NInput 
						value={input.email}
						type="text" 
						label={email.label}
						msg={email.msg}
						placeholder={email.placeholder}
						onChange={(e) => {
							input.email = (e.target as HTMLInputElement).value
						}}
					>
						{{
							icon: () => <IEmail/>,
							rightbutton: () => <button w:w='20' 
								w:outline="none focus:(none)"
								w:border="~ l-green-400 r-0 t-0 b-0"
								w:p='l-2'
							>{button.sendcode}</button>
						}}
					</NInput>

					<NSixinput
						value={input.sixinput}
						label={sixinput.label}
						msg={sixinput.msg}
						onChange={(e) => {
							input.sixinput[e.target.id] = (e.target as HTMLInputElement).value
						}}
					></NSixinput>

					<NButton p="1 x-20" type="button" value={button.register}
						onClick={async () => {
							const body = {
								username: input.username,
								passwd: input.password,
								email: input.email
							}
							const res = await $fetch('/api/user/signup', {
								method: 'POST',
								body
							})
							console.log(res);
						}}
					/>
				</div>
				<div  
					w:m='b-2'
					w:text="center"
				>
					<span w:text="xs gray-500">already have an account ? </span>
					<span w:text='xs green-800' w:cursor='pointer'><Link to='/login'>Login</Link></span>
				</div>
			</div>
		}
	}
})



