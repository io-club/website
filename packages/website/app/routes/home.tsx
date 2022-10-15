import type { LinksFunction, MetaFunction } from '@remix-run/server-runtime'

import { Link, Outlet } from '@remix-run/react'

import stylesUrl from '~/styles/articleBox.css'


export const meta: MetaFunction = () => ({
	title: 'Home',
})

export const handle = {
	breadcrumb: () => <Link to="/home">Home</Link>,
}

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: stylesUrl }]
}

export default function Home() {
	return (
		<div className="home-container w-screen  min-h-screen">
			<div className="top h-3xl w-full mb-20">
				<img className="h-full w-full object-cover" src="https://hsiaofongw.notion.site/images/page-cover/rijksmuseum_jansz_1641.jpg" alt="" />
			</div>
			<div className="mx-auto min-h-screen" w-w="1024px">
				<h1 w-text="60px" >探索IOClub首页</h1>
				<p>MemberList</p>
				<main>
					<Outlet />
				</main>
			</div>
			<div className="bottom">
			</div>
		</div>
	)
}
