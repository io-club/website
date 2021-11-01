import { useRequest } from 'vue-request';
import {useRoute,useRouter} from 'vue-router'

import toast from '~/utils/toast'
export interface SS {
	body: object,
	errormsg: string,
	logout: boolean,
	redirect: string,
}

export async function handleReq (
	url: string,
	method: string,
	opts?: Partial<SS>,
) {
	opts?.logout ?? await $fetch('/api/user/logout', {method: 'POST'})
	const { data, loading, error } = useRequest(
		$fetch(url, {
			method: method,
			body: opts?.body
		}), {
			onError: () => {
				toast(`${opts?.errormsg} ${error.value}`)
				return
			},
			onSuccess: () => {
				console.log(data.value, error.value, loading.value);
				if (opts?.redirect) {
					const router = useRouter()
					router.push(opts.redirect)
				}
			}
		}
	)
}