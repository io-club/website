export function key_token_verify(id: string) {
	return `token:verify:${id}`
}

export function key_user_index(idx: string, id: string) {
	return `user:index:${idx}:${id}`
}

export function key_user_meta(id: string) {
	return `user:meta:${id}`
}

export function key_user_sess(id: string) {
	return `user:sess:${id}`
}
