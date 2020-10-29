import Antd from 'ant-design-vue';
import routes from 'voie-pages'
import {createApp} from 'vue'
import {createRouter, createWebHistory} from 'vue-router'

import Main from './main.vue'

const app = createApp(Main)

app.use(createRouter({
	history: createWebHistory(),
	routes,
}))

app.use(Antd);
/*
new WaveUI(app, {
	breakpoints: {
		xs: 600,
		sm: 900,
		md: 1200,
		lg: 1700
	},
	colors: {
		// Polar night
		nord0: '#2E3440',
		nord1: '#3B4252',
		nord2: '#434c5e',
		nord3: '#4C566A',
		// Snow storm
		nord4: '#D8DEE9',
		nord5: '#E5E9F0',
		nord6: '#ECEFF4',
		// Frost
		nord7: '#8FBCBB',
		nord8: '#88C0D0',
		nord9: '#81A1C1',
		nord10: '#5E81AC',
		// Aurora
		nord11: '#BF616A',
		nord12: '#D08770',
		nord13: '#EBCB8B',
		nord14: '#A3BE8C',
		nord15: '#B48EAD',

		// From iterm2-material-design
		nblack: '#546e7a',
		nred: '#ff5252',
		ngreen: '#5cf19e',
		nyellow: '#ffd740',
		nblue: '#40c4ff',
		nmagenta: '#ff4081',
		ncyan: '#65fcda',
		nwhite: '#eceff1',

		lblack: '#b0bec5',
		lred: '#ff8a80',
		lgreen: '#b9f6ca',
		lyellow: '#ffe57f',
		lblue: '#80d8ff',
		lmagenta: '#ff80ab',
		lcyan: '#a7fdeb',
		lwhite: '#fcfcfc',
	},
})
*/

app.mount('#app')
