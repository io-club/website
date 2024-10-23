import type { Octokit as OctokitT } from '@octokit/rest'
import type { GetResponseDataTypeFromEndpointMethod } from '@octokit/types'

import { Octokit } from '@octokit/rest'

export const octokit: OctokitT = new Octokit({
	userAgent: 'ioclub v1.0.0',
	timeZone: 'Asia/Shanghai',
	baseUrl: 'https://api.github.com',
	auth: import.meta.env.GITHUB_AUTH,
	log: {
		debug: () => true,
		info: () => true,
		warn: console.warn,
		error: console.error,
	},
})

export async function fetchDir(tree_sha: string) {
	const res = await octokit.git.getTree({
		owner: 'io-club',
		repo: 'share',
		tree_sha,
	})
	return res.data.tree
}

export async function fetchSubdir(tree: GetResponseDataTypeFromEndpointMethod<typeof octokit.git.getTree>['tree']) {
	return await Promise.all(
		tree
			.filter((e) => e.type === 'tree')
			.map(async (e) => {
				return {
					path: e.path,
					sha: e.sha,
					shares: await fetchDir(e.sha as string),
				}
			}),
	)
}

export async function fetchBlob(file_sha: string) {
	const res = await octokit.git.getBlob({
		owner: 'io-club',
		repo: 'share',
		file_sha,
	})
	return res.data
}
