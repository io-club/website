import { $fetch } from 'ohmyfetch'
import ILArrow from 'virtual:icons/mdi/arrow-left'
import { defineComponent, reactive, Ref,ref} from 'vue'
import { useRouter } from 'vue-router'

import NButton from '~/components/login/button'
import Ninput from '~/components/login/input'
import LogoLink from '~/components/login/link'
import { useI18n } from '~/plugins/i18n'
import toast from '~/utils/toast'

const is_email = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
const alnon = /^[a-zA-Z0-9_]*$/
export default defineComponent({
	layout: 'login',
	setup() {
		const { login } = useI18n().i18n.value
		const router = useRouter()
		const state = ref(1)
		const inputs = reactive({
			username: '',
			password: '',
			password2: '',
			email: '',
			code: ''
		})
		const regBlock = () => {
			if (state.value == 1) {
				return <div>
					<LogoLink to='/login' icon={<ILArrow/>}>{`${login.problem.hasaccount} ${login.common.login}`}</LogoLink>
					<div w:m='t-4' w:text='2xl true-gray-900' w:font='medium'>{login.common.register}</div>
					<Ninput placeholder={login.placeholder.username} value={inputs.username} onChange={e => inputs.username = e}/>
				</div>
			} else if (state.value == 2) {
				return <div>
					<LogoLink to='#' icon={<ILArrow/>} onClick={() => state.value -= 1}>{`${login.laststep.changeusername} ${login.common.login}`}</LogoLink>
					<div w:m='t-4' w:text='2xl true-gray-900' w:font='medium'>{login.title.inputpassword}</div>
					<Ninput placeholder={login.placeholder.password} value={inputs.password} onChange={e => inputs.password = e}/>
					<Ninput placeholder={login.placeholder.password2} value={inputs.password2} onChange={e => inputs.password2 = e}/>
				</div>
			} else {
				return <div>
					<LogoLink to='#' icon={<ILArrow/>} onClick={() => state.value -= 1}>{`${login.laststep.changepassword} ${login.common.login}`}</LogoLink>
					<div w:m='t-4' w:text='2xl true-gray-900' w:font='medium'>{login.title.inputemail}</div>
					<Ninput placeholder={login.placeholder.email} value={inputs.email} onChange={e => inputs.email = e}/>
				</div>
			}
		}
		return () => {
			return <div>

				{regBlock()}
				<div w:p='t-5 b-1' w:text='right' >
					<NButton onClick={async () => {
						switch (state.value) {
						case 1:
							if (inputs.username && alnon.test(inputs.username)) {
								state.value = 2
							} else {
								toast(login.illegal.username)
							}
							break
						case 2:
							if (!inputs.password) {
								toast(login.illegal.password)
							} else if (inputs.password !== inputs.password2) {
								toast(login.illegal.samepassword)
							} else {
								state.value = 3
							}
							break
						case 3:
							if (is_email.test(inputs.email)) {
								try {
									await $fetch('/api/user/signup', {
										method: 'POST',
										body: {
											username: inputs.username,
											password: inputs.password,
											email: inputs.email
										}
									})
									router.push('/')
								} catch (e) {
									toast(`${login.errormsg.registererror} ${e.data}`)
								}
							} else {
								toast(login.illegal.email)
							}
							break
						}
					}}
					>{login.nextstep.nextstep}</NButton>
				</div>
			</div>
		}
	}
})
