import { component$, useSignal } from '@builder.io/qwik'

export default component$(() => {
	const counter = useSignal(0)
	console.log('3')

	return (
		<div w-flex-grow>
			<button w-text-2xl type='button' onClick$={() => counter.value++}>
				{counter.value}
			</button>
		</div>
	)
})
