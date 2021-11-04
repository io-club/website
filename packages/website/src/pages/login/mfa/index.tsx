import { defineComponent, reactive, ref} from 'vue'
import { useRoute,useRouter } from 'vue-router'

import Link from '~/components/link'
import { useI18n } from '~/plugins/i18n'

export default defineComponent({
	layout: 'login',
	setup() {
		const router = useRouter()
		const route = useRoute()
		const { i18n } = useI18n()
		return () => {

			const { login } = i18n.value
			return <div>
				<div w:m='t-2' w:text='2xl true-gray-900' w:font='medium'>{login.loginway.choosemfa}</div>
				<div w:p='t-5 b-2'>
					<button
						w:w='full'
						w:text='true-gray-50'
						w:bg='gray-700'
						w:p='x-5 y-2'
						w:transform='~ active:(scale-90)'
						onClick={() => {
							router.push('/login/mfa/email')
						}}>{login.loginway.email}</button>
				</div>
				<div w:p='t-1 b-2'>
					<button
						w:w='full'
						w:text='true-gray-900'
						w:p='x-5 y-2'
						w:transform='~ active:(scale-90)'
						w:border='1.5px gray-700'
						onClick={() => {
							router.push('/login/mfa/phone')
						}}>{login.loginway.phone}</button>
				</div>

				<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
					{login.problem.noaccount}<Link to='/login/register'><span w:text='light-blue-600'>{login.common.register}</span></Link>
				</div>
			</div>
		}
	}
})
