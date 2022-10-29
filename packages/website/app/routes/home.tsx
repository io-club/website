
import type { MetaFunction } from '@remix-run/server-runtime'
import type { IArticleBox } from '~/types/articleBox'

import { useFetcher } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import { useHydrated } from 'remix-utils'

import { ArticleBox } from '~/components/articleBox/articleBox'

export const meta: MetaFunction = () => ({
	title: 'home',
})

export const handle = {
	breadcrumb: () => 'home',
}

const Home = () => {
	const fetcher = useFetcher()
	const offset = useRef(0)
	const scroll = useRef(null)
	const [more, setMore] = useState(true)
	const [articles, setArticles] = useState<IArticleBox[]>([])
	useEffect(() => {
		if (fetcher.type === 'done') {
			if (fetcher.data.length > 0) {
				setArticles(v => v.concat(fetcher.data))
				offset.current += fetcher.data.length
			} else {
				setMore(false)
			}
		}
	}, [fetcher])
	useEffect(() => {
		const e = scroll.current
		const intersectionObserver = new IntersectionObserver(function(entries) {
			if (more && ['init', 'done'].some(v => v === fetcher.type) && entries[0].isIntersecting)
				fetcher.load(`/api/article/${offset.current}`)
		})

		if (e) {
			intersectionObserver.observe(e)
			return () => intersectionObserver.unobserve(e)
		}
	})

	return (
		<div className="w-screen min-h-screen">
			<div className="h-3xl w-100vw mb-20 home-top-img "></div>
			<div className="mx-auto mb-300px" w-w="1024px">
				<h1 w-text="60px">探索IOClub首页</h1>
				<p>MemberList</p>
				<div>
					{articles.map((v, i) => <ArticleBox key={i} data={v} />)}
				</div>
			</div>
			<div
				className="article-box-list-sentry"
				ref={scroll}
				w-h="300px"
				w-text="black center"
				w-align="middle"
			>
				{more ? '' : <div>END</div>}
			</div>
		</div>
	)
}

const Component = () => {
	const isHydrated = useHydrated()

	if (isHydrated) {
		return <Home />
	}
}

export default Component
