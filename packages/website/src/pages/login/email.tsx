import { Timer } from 'easytimer.js'
import { $fetch } from 'ohmyfetch'
import ILArrow from 'virtual:icons/mdi/arrow-left'
import { defineComponent, reactive, ref} from 'vue'
import { useRouter } from 'vue-router'

import NButton from '~/components/login/button'
import NInput from '~/components/login/input'
import LogoLink from '~/components/login/link'
import { useI18n } from '~/plugins/i18n'
import toast from '~/utils/toast'
export default defineComponent({
	layout: 'login',
	setup() {
		const router = useRouter()
		const { login } = useI18n().i18n.value
		const timer = new Timer()
		const alnon = /^[a-zA-Z0-9_]*$/
		const sendmsg = ref('发送验证码')
		const sending = ref(false)
		const code = ref('')
		return () => {
			return <div>
				<LogoLink to='/login/email' icon={<ILArrow/>}>{login.laststep.changeeorp}</LogoLink>
				<div w:m='t-2' w:text='2xl true-gray-900' w:font='medium'>{login.title.inputcode}</div>
				<div w:flex='~ row'>
					<NInput
						w:flex='grow'
						w:display='inline'
						placeholder={login.placeholder.code}
						onChange={e => code.value = e}
						class="tracking-1em"
						maxlength='6'
						w:text='placeholder-opacity-50 indent-xs'
					/>
					{console.log(sending.value)}
					<button disabled={ sending.value ? 'true' : 'false'} w:m="t-5 l-2" w:border='1' onClick={async () => {
						if (sending.value) return
						// try {
						// 	const res = await $fetch('/api/user/login/email')
						// 	console.log(res);
						// } catch (e) {
						// 	sendmsg.value = login.nextstep.sendcode
						// 	toast(`${login.errormsg.sendcode}: ${e.data}`)
						// 	return
						// }
						sending.value = true
						timer.start({countdown: true, startValues: {seconds: 10}});
						sendmsg.value = timer.getTimeValues().seconds.toString() + '秒后重新发送'
						timer.addEventListener('secondsUpdated', () => {
							sendmsg.value = timer.getTimeValues().seconds.toString() + '秒后重新发送'
						})
						timer.addEventListener('targetAchieved', function () {
							sendmsg.value = login.errormsg.resend
							sending.value = false
						});
					}}>{sendmsg.value}</button>
				</div>
				<div w:text='sm cool-gray-700' w:m='t-5' w:p='l-3px'>
					{login.errormsg.hassend} xxx
				</div>
				<div w:text='xs gray-400' w:m='t-5' w:p='l-3px'>
					<span>{login.problem.nocode}</span>
					<button
						w:display='inline'
						w:text='hover:(blue-600)'
						onClick={() => {
							console.log('重新发送');
						}}
					>{login.errormsg.resend}</button>
				</div>
				<div w:m='t-4' w:text='right'>
					<NButton onClick={async () => {
						if (alnon.test(code.value)) {
							console.log('尝试登录')
							try {
								const res = await $fetch('/api/user/login/code', {
									method: 'POST',
									body: {
										type: 'email',
										code: code.value
									}
								})
								toast(res)
							} catch (e) {
								toast(e, e.data)
							}
						} else {
							toast(login.errormsg.codeerror)
						}
					}}>{login.common.login}</NButton>
				</div>
			</div>
		}
	}
})
