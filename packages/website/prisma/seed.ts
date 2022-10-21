import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const db = new PrismaClient()

async function seedUser() {
	await db.user.create({
		data: {
			id: nanoid(),
			nick: 'Lyra',
			email: '1170155d48@qq.com',
			password: 'CuteLyra'
		},
	})
}

async function seed() {
	await seedUser()
}

seed()
