export const validators: Record<string, RegExp | undefined> = {
	username: /^[a-zA-Z0-9_]*$/,
	phone: /^(\+[0-9]{2})?[0-9]+$/,
	email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
}

export interface HandleResult {
	onSuccess?: () => void,
	onError?: () => void,
}

export function checkInput(
	e: string,
	type?: 'username' | 'email' | 'password' | 'phone',
	handler?: Partial<HandleResult>
): boolean {
	// type == type ?? ''
	const validator = validators[type]
	if (e !== '' && validator && validator.test(e)) {
		return true
	}
	if (handler) {
		if(handler.onError) handler.onError()
		if (handler.onSuccess) handler.onSuccess()
	}
	return false
}

export default validators