import type { LoaderFunction  } from '@remix-run/server-runtime'
import type {  IArticle } from '~/types/articleBox'

import { useLoaderData } from '@remix-run/react'
import { json, redirect } from '@remix-run/server-runtime'
import { getMDXComponent } from 'mdx-bundler/client'
import { useEffect, useMemo } from 'react'

import { db } from '~/utils/db.server'
import { getPost } from '~/utils/post'


type LoaderData = {
	article:{
		frontmatter: any;
		code: string;	
	},
	articleBox:IArticle
}


export const loader: LoaderFunction = async ({params}) => {
	if (!params) throw new Response('Not found', { status: 404 })
	if(params.id===undefined){
		redirect('/home')
	}
	const post = await getPost(params.articleId as string)
	if(post){
		const { frontmatter, code } = post
		const data = await getData(parseInt(params.articleId as string))
		return json({
			article:{
				frontmatter,
				code
			},
			articleBox:data
		})
	}
}
const getData = async (articleBoxId = 1) => {
	const articleData: IArticle = await db.articleBox.findUnique({
		where: {
			id: articleBoxId,
		},
		select: {
			id: true,
			type:true,
			data:true,
			name: true,
			title: true,
			content: true,
			createTime: true,
		},
	}) as IArticle
	return articleData
}
export default function ArticlePage() {
	const {article:{frontmatter,code},articleBox} = useLoaderData<LoaderData>()
	const Component = useMemo(() => getMDXComponent(code), [code])
	useEffect(()=>{
		console.log(frontmatter)
		const articleDataContainer = document.getElementById('article-data-container')
		// if(articleDataContainer&&pageData?.data){
		// 	// articleDataContainer.innerHTML = marked(pageData?.data)
		// }
	},[])
	return (
		<div w-text="black">
			<p>{frontmatter.title}</p>
			<div id="article-data-container" w-w="60vw">
				<Component attributes={frontmatter} />
			</div>
		</div>
	)
}