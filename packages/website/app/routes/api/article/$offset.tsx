import type { LoaderFunction } from '@remix-run/server-runtime'


export const loader: LoaderFunction = async ({ params, context  }:any) => {
	const data = await  context.db.articleBox.findMany({
		take: 6,
		skip: parseInt(params.offset!),
		select: {
			id: true,
			type: true,
			name: true,
			title: true,
			content: true,
			createTime: true,
		},
		orderBy: {
			id: 'desc'
		}
	})
	return data
}
