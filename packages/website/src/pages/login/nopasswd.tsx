import { $fetch } from 'ohmyfetch'
import queryString from 'query-string'
import Toastify from 'toastify-js'
import ILArrow from 'virtual:icons/mdi/arrow-left'
import { defineComponent, reactive, ref} from 'vue'
import { useRouter } from 'vue-router'

import Link from '~/components/link'
import NButton from '~/components/login/button'
import Ninput from '~/components/login/input'
import { useI18n } from '~/plugins/i18n'
import toast from '~/utils/toast'
export default defineComponent({
	setup() {
		const router = useRouter()
		const { i18n } = useI18n()
		const alnon = /^[a-zA-Z0-9_]*$/
		const is_email = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
		const is_phone = /^(\+[0-9]{2})?[0-9]+$/
		const field = ref('')
		return () => {
			const { login } = i18n.value
			return <div
				w:flex='~ grow'
				w:justify='center'
				w:align='items-center'
				w:h='full'
				w:p='8'
				w:border='1'
			>
				<div
					w:w='100'
					w:p='8'
					w:align='items-center'
					w:border='1 '
				>
					<NButton
						icon={<ILArrow/>}
						value={login.loginway.change}
						onClick={() => router.push('/login')}
					/>
					<div w:m='t-2' w:text='2xl true-gray-900' w:font='medium'>{login.common.login}</div>
					<Ninput placeholder={login.placeholder.eorp} value={field.value} onChange={e => field.value = e}/>
					<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
						{login.problem.noaccount} <Link to='/login/register'>{login.common.register}</Link>
					</div>
					<div w:m='t-4' w:text='right'>
						<button
							w:text='true-gray-50'
							w:bg='gray-700'
							w:p='x-5 y-2'
							w:transform='~ active:(scale-90)'
							onClick={async () => {
								console.log('????????????????//', field.value);
								if (is_email.test(field.value)) {
									try {
										await $fetch('/api/user/login_begin', {
											method: 'POST',
											body: {
												type: 'email',
												email: field.value
											}
										})
									}
									catch (e) {
										toast(`${login.errormsg.sendcode}: ${e.data}`)
										return
									}
									const url = queryString.stringifyUrl({url: '/login/code', query: {
										type: 'email',
										field: field.value
									}});
									router.push(url)
								} else if (is_phone.test(field.value)) {
									const url = queryString.stringifyUrl({url: '/login/code', query: {
										type: 'phone',
										field: field.value
									}});
									router.push(url)
								} else {
									toast(`${field.value} ${login.illegal.eorp}`)
								}
							}}>{login.nextstep.sendcode}</button>
					</div>

				</div>
			</div>
		}
	}
})
