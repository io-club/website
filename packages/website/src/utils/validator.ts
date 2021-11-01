export const validators: Record<string, RegExp | undefined> = {
	username: /^[a-zA-Z0-9_]*$/,
	phone: /^(\+[0-9]{2})?[0-9]+$/,
	email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
}

export function checkInput(
	e: string,
	type: 'username' | 'email' | 'password' | 'phone',
	onError: () => void
): boolean {
	const validator = validators[type]
	if (validator && validator.test(e)) {
		return true
	}
	onError()
	return false
}

export default validators