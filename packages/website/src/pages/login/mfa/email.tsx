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
		const field = ref('')
		const { loading, run: try_login } = useRequest(() =>
			$fetch('/api/user/login/code', {
				method: 'POST',
				body: JSON.stringify({
					type: 'email',
					code: field.value
				})
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
				router.push('/')
			}
		})

		const { loading: resending, run: try_resend} = useRequest('/api/user/login/email', {
			manual: true,
			onError: (e, params) => {
				if (e instanceof FetchError)
					console.log('onError', e, e instanceof FetchError, e.data, params)
				else
					console.log('onError', login.errormsg.network)
				return
			},
			onSuccess: () => {
				toast('发送成功', 'success')
			}
		})

		return () => {
			const { login } = i18n.value
			return <div>
				<div w:m='t-2' w:text='2xl true-gray-900' w:font='medium'>{login.loginway.mfa}</div>
				<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
                    我们已经将验证码发送至邮箱
				</div>
				<Ninput placeholder={login.placeholder.code} onChange={e => field.value = e}></Ninput>
				<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
					{login.problem.nocode}<Link to='#'>
						<span w:text='light-blue-600' onClick={try_resend}>{login.errormsg.resend}</span>
					</Link>
				</div>
				<div w:m='t-4' w:text='right'>
					<NButton
						disabled={loading.value}
						loading={loading.value}
						w:opacity={!loading.value ? '' : '50'}
						onClick={() => {
							console.log(
								JSON.stringify({
									type: 'email',
									code: field.value
								})
							);
							try_login()
						}}>{login.common.login}</NButton>
				</div>
				<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
					<Link><span w:text='light-blue-600'
						onClick={() => {router.push('/login/mfa')}}
					>{login.loginway.changefma}</span></Link>
				</div>
			</div>
		}
	}
})
