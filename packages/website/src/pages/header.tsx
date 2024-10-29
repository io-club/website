import { component$ } from '@builder.io/qwik'

import type { Route } from '@lib/types'

const ThemeButton = component$(() => {
	return (
		<button
			w-ml-auto
			type='button'
			onClick$={() => {
				document.documentElement.classList.toggle('dark')
			}}
		>
			<svg width='30px' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
				<title>theme button</title>
				<path
					w-fill-transparent
					dark:w-fill-slate-50
					fill-rule='evenodd'
					d='M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zm0 1.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm12-7a.8.8 0 0 1-.8.8h-2.4a.8.8 0 0 1 0-1.6h2.4a.8.8 0 0 1 .8.8zM4 12a.8.8 0 0 1-.8.8H.8a.8.8 0 0 1 0-1.6h2.5a.8.8 0 0 1 .8.8zm16.5-8.5a.8.8 0 0 1 0 1l-1.8 1.8a.8.8 0 0 1-1-1l1.7-1.8a.8.8 0 0 1 1 0zM6.3 17.7a.8.8 0 0 1 0 1l-1.7 1.8a.8.8 0 1 1-1-1l1.7-1.8a.8.8 0 0 1 1 0zM12 0a.8.8 0 0 1 .8.8v2.5a.8.8 0 0 1-1.6 0V.8A.8.8 0 0 1 12 0zm0 20a.8.8 0 0 1 .8.8v2.4a.8.8 0 0 1-1.6 0v-2.4a.8.8 0 0 1 .8-.8zM3.5 3.5a.8.8 0 0 1 1 0l1.8 1.8a.8.8 0 1 1-1 1L3.5 4.6a.8.8 0 0 1 0-1zm14.2 14.2a.8.8 0 0 1 1 0l1.8 1.7a.8.8 0 0 1-1 1l-1.8-1.7a.8.8 0 0 1 0-1z'
				/>
				<path
					w-fill-black
					dark:w-fill-transparent
					fill-rule='evenodd'
					d='M16.5 6A10.5 10.5 0 0 1 4.7 16.4 8.5 8.5 0 1 0 16.4 4.7l.1 1.3zm-1.7-2a9 9 0 0 1 .2 2 9 9 0 0 1-11 8.8 9.4 9.4 0 0 1-.8-.3c-.4 0-.8.3-.7.7a10 10 0 0 0 .3.8 10 10 0 0 0 9.2 6 10 10 0 0 0 4-19.2 9.7 9.7 0 0 0-.9-.3c-.3-.1-.7.3-.6.7a9 9 0 0 1 .3.8z'
				/>
			</svg>
		</button>
	)
})

export default component$<{ pages: Route[] }>((props) => {
	return (
		<header
			w-h-16
			w-w-full
			w-flex
			w-item-center
			w-sticky
			w-top-0
			w-z-250
			w-p-x-10
			w-bg-slate-50
			dark:w-bg-slate-800
			w-border-b-1
			w-border-slate-200
			dark:w-border-slate-700
			w-shadow-lg
			w-shadow-slate-200
			dark:w-shadow-slate-900
		>
			<img src='/logo.svg' alt='IO' w-p-y-2 w-m-r-8 />
			<nav w-w-full w-flex w-items-center>
				<ul w-flex w-items-center w-h-full w-w-min>
					{props.pages.map((a) => (
						<li key={a.slug} w-p-x-4 w-text-md>
							<a href={`/${a.path}`}>{a.slug}</a>
						</li>
					))}
				</ul>
				<ThemeButton />
			</nav>
		</header>
	)
})
