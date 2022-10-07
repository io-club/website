import type { LoaderFunction } from '@remix-run/server-runtime'

import { db } from '~/utils/db.server'

export const loader: LoaderFunction = async ({ params }) => {
	const data = await db.articleBox.findMany({
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
