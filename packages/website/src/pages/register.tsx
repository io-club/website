
import { $fetch } from 'ohmyfetch'
import IAlien from 'virtual:icons/mdi/alien-outline'
import IEmail from 'virtual:icons/mdi/email'
import IPassword from 'virtual:icons/ri/lock-password-line'
import IKey from 'virtual:icons/wpf/password1'
import { defineComponent, reactive,ref } from 'vue'

// import { useFetch } from '#app'
import Link from '~/components/link'
import NButton from '~/components/login/nbutton'
import NInput from '~/components/login/ninput'
import NSixinput from '~/components/login/nsixinput'
export default defineComponent({

	setup() {

		const input = reactive({
			username: '',
			password: '',
			password2: '',
			email: '',
			sixinput: ['', '', '', '', '', ''],
		})

		return () => {
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
						label="Username" 
						msg="请填写用户名" 
						placeholder="Type your username"
						onChange={(e) => {
							input.username = e.target.value
						}}
					>
						{{
							icon: () => <IAlien/>
						}}
					</NInput>

					<NInput type="text"
						value={input.password}
						label="Password" 
						msg="请填写密码" 
						placeholder="Type your password" 
						onChange={(e) => {
							input.password = e.target.value
						}}
					>
						{{
							icon: () => <IPassword/>
						}}
					</NInput>

					<NInput type="text" 
						value={input.password2}
						label="Ensure Password" 
						msg="密码不一致" 
						placeholder="Type your password again" 
						onChange={(e) => {
							input.password2 = e.target.value
						}}
					>
						{{
							icon: () => <IKey/>
						}}
					</NInput>

					<NInput 
						value={input.email}
						type="text" 
						label="Email" 
						msg="请填写邮箱" 
						placeholder="Type your email"
						onChange={(e) => {
							input.email = e.target.value
						}}
					>
						{{
							icon: () => <IEmail/>,
							rightbutton: () => <button w:w='20' 
								w:outline="none focus:(none)"
								w:border="~ l-green-400 r-0 t-0 b-0"
								w:p='l-2'
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

					<NButton p="1 x-20" type="button" value='注册' 
						onClick={async () => {
							const body = {
								username: input.username,
								passwd: input.password,
								email: input.email
							}
							console.log('按下注册按钮')
							console.log(body);
							const {res} = $fetch('/api/user/signup', {
								method: 'POST',
								body
							})
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



