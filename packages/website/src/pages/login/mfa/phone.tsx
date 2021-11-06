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
				<div w:m='t-2' w:text='2xl true-gray-900' w:font='medium'>{login.loginway.mfa}</div>
				<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
                    我们已经将验证码发送至手机
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
						onClick={() => {router.push('/login/mfa')}}
					>{login.loginway.changefma}</span></Link>
				</div>
			</div>
		}
	}
})
