import type { LinksFunction, MetaFunction } from '@remix-run/server-runtime'

import {
	Link,
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
import HeaderNav from './components/headerNav'

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
export const handle = {
	breadcrumb: () => <Link to="/">IO-Club</Link>,
  };
export default function App() {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="flex-col" w:flex='' w:min-h="100vh" w:w='100vw'  w:p="0" w:m="0">
				<HeaderNav/>
				<Outlet />
				<ScrollRestoration />
				<ExternalScripts />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
