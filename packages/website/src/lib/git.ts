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

export type Tree = GetResponseDataTypeFromEndpointMethod<typeof octokit.git.getTree>['tree']

export async function fetchTree(tree_sha: string, recursive = false): Promise<Tree> {
	const req = {
		owner: 'io-club',
		repo: 'share',
		tree_sha,
	}
	const res = await octokit.git.getTree(recursive ? { ...req, recursive: '1' } : req)
	return res.data.tree
}

export async function fetchBlob(file_sha: string) {
	const res = await octokit.git.getBlob({
		owner: 'io-club',
		repo: 'share',
		file_sha,
	})
	return res.data
}
