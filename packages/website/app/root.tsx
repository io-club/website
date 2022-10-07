import type { LinksFunction, MetaFunction } from '@remix-run/server-runtime'

import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react'
import { ExternalScripts } from 'remix-utils'

import HeaderNav from '~/components/headerNav'
import rootCssUrl from '~/styles/root.css'
import unoCssUrl from '~/uno.css'

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: rootCssUrl,
		},
		{
			rel: 'stylesheet',
			href: unoCssUrl,
		},
	]
}

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'IOLab 2022',
	viewport: 'width=device-width,initial-scale=1',
})

export const handle = {
	breadcrumb: () => 'IO-Club',
}

export default function App() {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body
				className="min-h-screen font-normal"
				w-scrollbar='~ w-0px'
				w-flex="col"
				w-justify="center"
				w-p="0"
				w-m="0"
				w-text="neutral-500"
				w-bg="light-50"
			>
				<HeaderNav />
				<main w-flex="grow">
					<Outlet />
				</main>
				<ScrollRestoration />
				<ExternalScripts />
				<Scripts />
			</body>
		</html>
	)
}
