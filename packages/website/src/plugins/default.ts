import type {Plugin} from '#app'

import './windicss.css'
import 'virtual:windi.css'

import {setI18n} from '@ioclub/composable'

import zh_CN from '@/locales/zh_CN'

const plugin: Plugin = async function (app) {
	setI18n({
		locale: 'zh-cn',
		messages: {
			'zh-cn': zh_CN,
		},
	}, app.provide)
	return
}
export default plugin
