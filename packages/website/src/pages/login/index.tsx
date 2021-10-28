import queryString from 'query-string'
import ILArrow from 'virtual:icons/mdi/arrow-left'
import { defineComponent, reactive, ref} from 'vue'
import {useRoute,useRouter} from 'vue-router'

import Link from '~/components/link'
import NButton from '~/components/login/button'
import Ninput from '~/components/login/input'
import { useI18n } from '~/plugins/i18n'
import toast from '~/utils/toast'
export default defineComponent({
	setup() {
		const router = useRouter()
		const route = useRoute()
		const { i18n } = useI18n()
		const alnon = /^[a-zA-Z0-9_]*$/
		const username = ref('')
		const { login } = i18n.value
		return () => {
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
						value={login.loginway.eorp}
						onClick={() => router.push('/login/nopassword')}
					/>
					<div w:m='t-4' w:text='2xl true-gray-900' w:font='medium'>{login.common.login}</div>
					<Ninput placeholder={login.placeholder.username} value={username.value} onChange={e => username.value = e}/>
					<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
						{login.problem.noaccount} <Link to='/login/register'><span w:text='light-blue-600'>{login.common.register}</span></Link>
					</div>
					<div w:m='t-4' w:text='right'>
						<button
							w:text='true-gray-50'
							w:bg= 'gray-700'
							w:p='x-5 y-2'
							w:transform='~ active:(scale-90)'
							onClick={async () => {
								if (username.value != '' && alnon.test(username.value)) {
									try {
										const res = await $fetch('/api/user/login', {
											method: 'POST',
											body: {
												type: 'password',
												username: username.value,
											}
										})
										router.push(`/login/${res}`)
									} catch(e) {
										toast(`${login.errormsg.nouser} ${e.data}`)
										return
									}
								} else {
									toast(login.illegal.username)
								}
							}}>{login.nextstep.nextstep}</button>
					</div>
				</div>
			</div>
		}
	}
})
