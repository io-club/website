import haskell from 'highlight.js/lib/languages/haskell'

import { db } from '~/utils/db.server'

import { bundleMDX } from './mdx.server'

export type Post = {
	slug: string;
	title: string;
};

export type PostMarkdownAttributes = {
	title: string;
};

export async function getPost(slug: string) {
	const articleWholeData:{data:string}= await db.articleBox.findUnique({
		where:{
			id:parseInt(slug)
		},
		select:{
			data:true
		}
	})
	const source = articleWholeData.data
	console.log(source)
	const rehypeHighlight = await import('rehype-highlight').then(
		(mod) => mod.default
	)
	const { default: remarkGfm } = await import('remark-gfm')
	const { default: rehypeAutolinkHeadings } = await import(
		'rehype-autolink-headings'
	)

	const { default: rehypeToc } = await import('rehype-toc')
	const { default: rehypeSlug } = await import('rehype-slug')

	const post = await bundleMDX({
		source,
		//@ts-ignore
		xdmOptions(options) {
			options.remarkPlugins = [
				...(options.remarkPlugins ?? []),
				remarkGfm,
			]
			options.rehypePlugins = [
				...(options.rehypePlugins ?? []),
				rehypeAutolinkHeadings,
				rehypeSlug,
				rehypeToc,
				[
					rehypeHighlight,
					{ format: 'detect', ignoreMissing: true, languages: { haskell } },
				],
			]
			return options
		},
	}).catch((e) => {
		console.error(e)
		throw e
	})
	console.log(post)
	return post
}