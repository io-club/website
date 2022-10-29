import type { LoaderFunction } from '@remix-run/server-runtime'

export const loader: LoaderFunction = async ({ request, params, context }) => {
	const data = await context.db.user.findUnique({
		where: { id: params.id! },
		select: {
		},
	})

	return data
}
