import {customAlphabet, nanoid} from 'nanoid'
import { $fetch, FetchError } from 'ohmyfetch'
import queryString from 'query-string'
import ILArrow from 'virtual:icons/mdi/arrow-left'
import { computed,defineComponent, reactive, ref, watch} from 'vue'
import { useRequest } from 'vue-request';
import { useRoute, useRouter } from 'vue-router'

import { useNuxtApp } from '#app'
import Link from '~/components/link'
import NButton from '~/components/login/button'
import Ninput from '~/components/login/input'
import LogoLink from '~/components/login/link'
import { useI18n} from '~/plugins/i18n'
import toast from '~/utils/toast'
export default defineComponent({
	layout: 'login',
	setup() {
		const route = useRoute()
		const router = useRouter()
		const { i18n } = useI18n()
		const login2 = reactive({
			i: computed(() => i18n.value.login),
			password: ref(''),
		})
		const customed_nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 80)
		const password = ref('')
		const storage = useNuxtApp().$__storage
		const { data: enforce, loading, run } = useRequest(() =>
			$fetch('/api/user/login/password', {
				method: 'POST',
				body: {
					password: password.value
				}
			}), {
			manual: true,
			onError: (e, params) => {
				if (e instanceof FetchError)
					console.log('onError', e, e instanceof FetchError, e.data, params)
				else
					console.log('onError', login2.i.errormsg.network)
				return
			},
			onSuccess: (data) => {
				console.log('OnSuccess: ', data);
				console.log('prefer: ', data.prefer);
				console.log('methods: ', data.methods);
				console.log('data.data: ', data.data)
				if (!data.prefer && !data.methods) {
					console.log('登录成功，不用两步校验')
					return
				}
				if (data.prefer != 'none') {
					console.log('登录成功，需要两步校验， 有prefer')
					// router.push('/login/mfa/' + data.prefer)
					return
				}
				console.log('登录成功，需要两步校验， 但没有prefer')
				// router.push('/login/mfa/email')
			}
		})

		const { loading: sending } = useRequest('/api/user/login/email', {
			// ready: computed(() => enforce.value && enforce.value.prefer != 'phone'),
			manual: true,
			onError: (e, params) => {
				console.log('网络异常');
			},
			onSuccess: (data) => {
				router.push('/login/mfa/email')
			}
		})

		return () => {
			const login = login2.i
			return <div>
				<LogoLink to='/login' icon={<ILArrow/>}>{login.laststep.changeusername}</LogoLink>
				<div w:m='t-2' w:text='2xl true-gray-900' w:font='medium'>{login.title.inputpassword}</div>
				<Ninput placeholder={login.placeholder.password} value={password.value} onChange={e => password.value = e}/>
				<div w:text='sm cool-gray-700' w:m='t-3' w:p='l-3px'>
					{login.problem.forgetpassword}
					<Link to='/login/email'>{login.loginway.change}</Link>
				</div>
				<div w:m='t-4' w:text='right'>
					<NButton
						disabled={loading.value}
						loading={loading.value}
						w:opacity={!loading.value ? '' : '50'}
						onClick={run}>{login.nextstep.nextstep}</NButton>
				</div>
			</div>
		}
	}
})
