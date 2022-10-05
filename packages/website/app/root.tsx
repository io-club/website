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

import globalStylesUrl from './styles/global.css'
import globalLargeStylesUrl from './styles/global-large.css'
import globalMediumStylesUrl from './styles/global-medium.css'
import globalWindiUrl from './styles/windi.css'

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: globalWindiUrl,
		},
		{
			rel: 'stylesheet',
			href: globalStylesUrl,
		},
		{
			rel: 'stylesheet',
			href: globalMediumStylesUrl,
			media: 'print, (min-width: 640px)',
		},
		{
			rel: 'stylesheet',
			href: globalLargeStylesUrl,
			media: 'screen and (min-width: 1024px)',
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
			<body className="flex" w:h="screen" w:p="0" w:m="0">
				<Outlet />
				<ScrollRestoration />
				<ExternalScripts />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
