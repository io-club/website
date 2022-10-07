import type { LinksFunction, MetaFunction } from '@remix-run/server-runtime'

import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react'
import { ExternalScripts } from 'remix-utils'

import globalUnoUrl from './styles/uno.css'

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: globalUnoUrl,
		},
	]
}

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'IOLab 2022',
	viewport: 'width=device-width,initial-scale=1',
})

export default function App() {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="flex" w-h="screen" w-p="0" w-m="0">
				<Outlet />
				<ScrollRestoration />
				<ExternalScripts />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
