import type { ActionFunction, LinksFunction } from '@remix-run/node';

import { redirect } from '@remix-run/node'
import { Form, useSearchParams } from '@remix-run/react'
import faunadb, { query as q } from 'faunadb'
import { json, useActionData } from 'remix-utils'

import stylesUrl from '~/styles/register.css'

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: stylesUrl }]
}

type ActionData = {
	formError?: Error
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
		const client = new faunadb.Client({
			secret: process.env['FAUNA_ADMIN_KEY'] ?? '',
			domain: 'db.us.fauna.com',
			scheme: 'https',
		})
		const res = await client.query(q.Create(q.Collection('student'), { data: data }))
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
			formError: err, formData: {
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
	const typ = searchParams.get('type')
	return (
		<div className="container">
			<div className="content" data-light="">
				<h1>注册</h1>
				{typ !== 'badass' ? null : <div>
					<img src='/contra.jpg' alt='contra cover' />
				</div>}
				<Form method="post" style={{ textAlign: 'center' }}>
					{typ === 'finished' ? null : <div>
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
								{formError.message}
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
