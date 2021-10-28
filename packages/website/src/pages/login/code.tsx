import 'toastify-js/src/toastify.css'

import { $fetch } from 'ohmyfetch'
import ILArrow from 'virtual:icons/mdi/arrow-left'
import { defineComponent, reactive, ref} from 'vue'
import { useRouter } from 'vue-router'

import NButton from '~/components/login/button'
import NInput from '~/components/login/input'
import { useI18n } from '~/plugins/i18n'
import toast from '~/utils/toast'
export default defineComponent({
	setup() {
		const router = useRouter()
		const { login } = useI18n().i18n.value
		const alnon = /^[a-zA-Z0-9_]*$/
		return () => {
			const username = ref('')
			return <div
				w:flex='~ grow'
				w:justify='center'
				w:align='items-center'
				w:h='full'
				w:p='8'
				w:border='1 rounded'
			>
				<div
					w:w='100'
					w:p='8'
					w:align='items-center'
					w:border='1 '
				>
					<NButton
						icon={<ILArrow/>}
						value={login.laststep.changeeorp}
						onClick={() => router.push('/login/nopassword')}
					/>
					<div w:m='t-2' w:text='2xl true-gray-900' w:font='medium'>{login.title.inputcode}</div>
					<NInput
						placeholder={login.placeholder.code}
						onChange={e => username.value = e}
						class="tracking-1em"
						maxlength='6'
						w:text='placeholder-opacity-50 indent-xs'
					/>
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
						<button
							w:text='true-gray-50'
							w:bg='gray-700'
							w:p='x-5 y-2'
							w:transform='~ active:(scale-90)'
							onClick={() => {
								if (alnon.test(username.value)) {
									console.log('尝试登录')
								} else {
									toast(login.errormsg.codeerror)
								}
							}}>{login.nextstep.nextstep}</button>
					</div>

				</div>
			</div>
		}
	}
})
