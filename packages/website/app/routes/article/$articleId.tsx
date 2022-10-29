import type { AppLoadContext, LoaderFunction } from '@remix-run/server-runtime'
import type { IArticle } from '~/types/articleBox'

import { json, redirect } from '@remix-run/server-runtime'

export const loader: LoaderFunction = async ({params, context}) => {
	if (!params) throw new Response('Not found', { status: 404 })
	if(params.id===undefined){
		redirect('/home')
	}
	const data = await getData(parseInt(params.articleId as string), context)
	return json({
		articleBox: data
	})
}

const getData = async (articleBoxId = 1, context: AppLoadContext) => {
	const articleData: IArticle = await context.db.articleBox.findUnique({
		where: {
			id: articleBoxId,
		},
		select: {
			id: true,
			type: true,
			data: true,
			name: true,
			title: true,
			content: true,
			createTime: true,
		},
	}) as IArticle

	return articleData
}

export default function ArticlePage() {
	return (
		<div w-text="black">
			<div id="article-data-container" w-w="60vw">
			</div>
		</div>
	)
}
