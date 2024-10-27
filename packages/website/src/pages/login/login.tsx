import { component$ } from '@builder.io/qwik'
import ky from 'ky'

export default component$(() => {
	return (
		<div w-flex-grow>
			<form
				w-flex='~ col'
				preventdefault:submit
				onSubmit$={async (ev: Event) => {
					const data: Record<string, FormDataEntryValue> = {}
					for (const [k, v] of new FormData(ev.target as HTMLFormElement).entries()) {
						data[k] = v
					}
					console.log(4, data)

					const json = await ky.post('/api/login.json', { json: { ...data } }).json()
					console.log(8, json)
					return false
				}}
			>
				<div>
					<p>name:</p>
					<input name='name' type='text' />
				</div>
				<div>
					<p>pass:</p>
					<input name='ss' type='password' />
				</div>
				<button w-text-2xl type='submit'>
					Send
				</button>
			</form>
		</div>
	)
})
