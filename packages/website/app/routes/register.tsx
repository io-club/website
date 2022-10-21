import type { ActionFunction, LinksFunction } from '@remix-run/server-runtime'

import { Form, useSearchParams } from '@remix-run/react'
import { redirect } from '@remix-run/server-runtime'
import { json, useActionData } from 'remix-utils'

import stylesUrl from '~/styles/register.css'

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: stylesUrl }]
}

type ActionData = {
	formError?: string
	formData: {
		username: string
		name: string
		class: string
		msg: string
	}
}

const registerStudent = async (data: FormData) => {
	try {
		const checks = ['username', 'class', 'name']
		for (let i = 0; i < checks.length; i++) {
			const v = checks[i]
			if (data.get(v) instanceof String || data.get(v) === '') {
				throw `${v}不能为空`
			}
		}
		if (!/^\d+$/g.test(data.get('username')?.toString() ?? '')) {
			throw '学号必须全是数字'
		}
		/*
		const client = new faunadb.Client({
			secret: process.env['FAUNA_ADMIN_KEY'] ?? '',
			domain: 'db.us.fauna.com',
			scheme: 'https',
		})

		const map: Record<string, unknown> = {}
		for (const [k, v] of data.entries()) {
			map[k] = v
		}
		const res = await client.query(q.Create(q.Collection('student'), { data: map }))
		*/
		console.log(res)
		return null
	} catch (err) {
		if (err instanceof Error) {
			return err
		} else {
			return new Error(`${err}`)
		}
	}
}

export const action: ActionFunction = async ({
	request,
}) => {
	const formData = await request.formData()
	formData.forEach((v, k, _) => console.log(`formData[${k}] = ${v}`))
	const err = await registerStudent(formData)
	if (err !== null) {
		console.error('Error: [%s] %s', err.name, err.message)
		return json<ActionData>({
			formError: err.message, formData: {
				username: formData.get('username')?.toString() ?? '',
				name: formData.get('name')?.toString() ?? '',
				class: formData.get('class')?.toString() ?? '',
				msg: formData.get('msg')?.toString() ?? '',
			}
		})
	}
	const e = redirect('/register?type=finished')
	console.log(e)
	return e
}

export default function Index() {
	const [searchParams] = useSearchParams()
	const actionData = useActionData<ActionData>({})
	const formError = actionData?.formError
	const formData = actionData?.formData
	console.log(actionData)
	const typ = searchParams.get('type')
	return (
		<div className="container">
			<div className="content" data-light="">
				<h1>注册</h1>
				{typ !== 'badass' ? null : <div>
					<img src='/contra.jpg' alt='contra cover' />
				</div>}
				<Form method="post" style={{ textAlign: 'center' }}>
					{typ === 'finished' ? <img src='/2022.jpg' alt='qq group' /> : <div>
						<div>
							<label htmlFor="name-input">姓名：</label>
							<input
								id="name-input"
								name="name"
								defaultValue={formData?.name}
								type="plain"
							/>
						</div>
						<div>
							<label htmlFor="class-input">班级：</label>
							<input
								id="class-input"
								name="class"
								defaultValue={formData?.class}
								type="plain"
							/>
						</div>
						<div>
							<label htmlFor="username-input">学号：</label>
							<input
								id="username-input"
								name="username"
								defaultValue={formData?.username}
								type="plain"
							/>
						</div>
						<div>
							<label htmlFor="msg-input">留言：</label>
							<input
								id="msg-input"
								name="msg"
								defaultValue={typ === 'badass' ? 'badass' : formData?.msg}
								type="plain"
							/>
						</div>
						<div id="form-error-message">
							{!formError ? null : <p
								className="form-validation-error"
								role="alert"
							>
								{formError}
							</p>
							}
						</div>
					</div>}
					<button type="submit" className="button" disabled={typ === 'finished'}>
						{typ === 'finished' ? '提交完成' : '提交'}
					</button>
				</Form>
			</div>
		</div>
	)
}
