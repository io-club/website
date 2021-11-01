import { $fetch, FetchError } from 'ohmyfetch'
import queryString from 'query-string'
import ILArrow from 'virtual:icons/mdi/arrow-left'
import { defineComponent, reactive, ref} from 'vue'
import { useRequest } from 'vue-request';
import { useRouter } from 'vue-router'

import Link from '~/components/link'
import NButton from '~/components/login/button'
import Ninput from '~/components/login/input'
import LogoLink from '~/components/login/link'
import { useI18n } from '~/plugins/i18n'
import toast from '~/utils/toast'
export default defineComponent({
	layout: 'login',
	setup() {
		const router = useRouter()
		const { i18n } = useI18n()
		const { login } = useI18n().i18n.value
		const a = ref(1)
		const { loading, run } = useRequest(() =>
			$fetch('/api/user/login', {
				method: 'POST',
				body: {
					type: 'email',
					email: field.value
				}
			}), {
			manual: true,
			onError: (e, params) => {
				if (e instanceof FetchError)
					console.log('onError', e, e instanceof FetchError, e.data, params)
				else
					console.log('onError', login.errormsg.network)
				return
			},
			onSuccess: (data, param) => {
				console.log('onSucess', data, param);
				if (data === 'OK') {
					console.log('login complete');
				} else {
					router.push('/login/')
				}
			}
		})
		const field = ref('')
		return () => {
			const { login } = i18n.value

			return <div>
				{(() => {
					switch (a.value) {
					case 1:
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
										a.value = 2
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
										a.value = 2
									}}>{login.loginway.phone}</button>
							</div>

							<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
								{login.problem.noaccount}<Link to='/login/register'><span w:text='light-blue-600'>{login.common.register}</span></Link>
							</div>
						</div>
					case 2:
						return <div>
							<div w:m='t-2' w:text='2xl true-gray-900' w:font='medium'>{login.loginway.mfa}</div>
							<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
								我们已经将验证码发送至邮箱
							</div>
							<Ninput placeholder={login.placeholder.code} ></Ninput>
							<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
								{login.problem.nocode}<Link to='#'><span w:text='light-blue-600'>{login.errormsg.resend}</span></Link>
							</div>
							<div w:m='t-4' w:text='right'>
								<NButton
									disabled={loading.value}
									loading={loading.value}
									w:opacity={!loading.value ? '' : '50'}
									onClick={run}>{login.common.login}</NButton>
							</div>
							<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
								<Link><span w:text='light-blue-600'
									onClick={() => {a.value = 1}}
								>{login.loginway.changefma}</span></Link>
							</div>
						</div>
					}
				})()}
			</div>
		}
	}
})
