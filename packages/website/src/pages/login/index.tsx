import { FetchError } from 'ohmyfetch'
import ILArrow from 'virtual:icons/mdi/arrow-left'
import { defineComponent, ref, watch } from 'vue'
import { useRequest } from 'vue-request';
import { useRouter } from 'vue-router'

import Link from '~/components/link'
import NButton from '~/components/login/button'
import Ninput from '~/components/login/input'
import LogoLink from '~/components/login/link'
import { useI18n } from '~/plugins/i18n'
import toast from '~/utils/toast'
import { checkInput } from '~/utils/validator'

export default defineComponent({
	layout: 'login',
	setup() {
		const router = useRouter()
		const { i18n } = useI18n()
		const field = ref('')
		const { login } = i18n.value
		watch(field, () => {
			if (checkInput(field.value) || checkInput(field.value)) {
				return
			}
			toast('输入格式不符')
		})
		const try_next = () => {
			if (checkInput(field.value, 'username')) {
				toast('尝试使用用户名')
				try_username()
				return
			}
			else if (checkInput(field.value, 'email')) {
				toast('尝试使用邮箱')
				try_email()
				return
			}
			toast(login.illegal.username, 'warning')
		}
		const { loading: loading, run: try_username } = useRequest(() =>
			$fetch('/api/user/login', {
				method: 'POST',
				body: {
					type: 'password',
					password: field.value
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
				router.push('/login/email')
			}
		})
		const { loading: loading2, run: try_email } = useRequest(() =>
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
				router.push('/login/email')
			}
		})

		return () => {
			return <div>
				{/* <LogoLink to='/login/mfa' icon={<ILArrow/>}>{login.loginway.eorp}</LogoLink> */}
				<div w:m='t-4' w:text='2xl true-gray-900' w:font='medium'>
					{/* {login.title.inputusername} */}
					{login.common.login}
				</div>
				<Ninput
					placeholder='输入用户名邮箱或密码' //{login.placeholder.username}
					value={field.value}
					onChange={e => field.value = e}/>
				<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
					{login.problem.noaccount}
					<Link to='/login/register'>
						<span w:text='light-blue-600'>{login.common.register}</span>
					</Link>
				</div>
				<div w:m='t-4' w:text='right'>
					<NButton
						disabled={loading.value}
						loading={loading.value}
						w:opacity={!loading.value ? '' : '50'}
						onClick={try_next}
					>
						{login.nextstep.nextstep}
					</NButton>
				</div>
			</div>
		}
	}
})
