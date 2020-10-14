// @ts-expect-error
import hero from '@windicss/plugin-heropatterns'
import { defineConfig } from 'windicss/helpers'
import plugin from 'windicss/plugin'
import ratio from 'windicss/plugin/aspect-ratio'
import typography from 'windicss/plugin/typography'

function generateRainbow() {
	const r: Record<string, unknown> = {}
	const c = 4

	function calcColor(perc: number)
	{
		const minHue = 360, maxHue=0;
		return `hsl(${perc * (maxHue-minHue) + minHue},100%,50%)`
	}

	let v = 100
	const v_step = v / c

	for (; v>=0;) {
		r[`${v}%`] = {
			background: `linear-gradient(to bottom right, ${calcColor(v / 100)}, ${calcColor( (v + 40) / 100 )})`,
		}
		v -= v_step
	}

	return r
}

function generate360() {
	const r: Record<string, unknown> = {}
	const c = 4

	let x = 720
	const x_step = - x / c

	let y = 0
	const y_step = 360 / c

	let z = 0
	const z_step = 360 / c

	let v = 100
	const v_step = v / c

	for (; v>=0;) {
		r[`${v}%`] = {
			transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
		}
		if (v === 0) {
			break
		}

		r[`${v-1}%`] = {
			transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
		}
		r[`${v-0.7}%`] = {
			transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg) scale(1.2)`,
		}
		r[`${v-0.5}%`] = {
			transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
		}
		r[`${v-0.3}%`] = {
			transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg) scale(1.1)`,
		}
		x += x_step
		y += y_step
		z += z_step
		v -= v_step
	}

	return r
}

export default defineConfig({
	extract: {
		include: ['**/*.{vue,html,jsx,tsx}'],
		exclude: ['node_modules', '.git'],
	},
	darkMode: 'class',
	theme: {
		//screens,
		//colors,
		//fontSize,
		//width: fontSizeForSizing,
		//height: fontSizeForSizing,
		fontFamily: {
			sans: ['Graphik', 'sans-serif'],
			serif: ['Merriweather', 'serif'],
		},
		extend: {
			animation: {
				'expandX': 'expandX 0.5s cubic-bezier(.17, .84, .44, 1) 1',
				'rotate360': 'rotate360 10s linear infinite',
				'bg400': 'bg400 10s ease infinite',
			},
			gridTemplateColumns: {
				auto: 'repeat(auto-fill, minmax(0, 250px))',
			},
			keyframes: {
				'expandX': {
					'from': {transform: 'scaleX(0)'},
					'to': {transform: 'scaleX(1)'},
				},
				'rotate360': generate360(),
				'bg400': {
					'0%,100%': {'background-position': '0% 17%'},
					'50%': {'background-position': '100% 83%'},
				},
			},
			transitionTimingFunction: {
				'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
				'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
				'bounce': 'cubic-bezier(.17, .84, .44, 1)',
			},
			backgroundImage: {
				'rainbow': 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
			},
			backgroundSize: {
				'400': '400% 400%',
			},
			spacing: {
				'128': '32rem',
				'144': '36rem',
			},
			borderRadius: {
				'4xl': '2rem',
			},
			transitionProperty: {
				'underline': 'border-b',
			},
		}
	},
	plugins: [
		typography(),
		ratio,
		hero({
			patterns: ['circuit-board'],
			includeThemeColors: true,
		}),
		plugin(function ({addVariant, addDynamic, theme}) {
			addDynamic('ratio', ({Utility, Style}) => {
				const prop = parseInt(Utility.handler.handleNumber(1, undefined, 'int').value ?? '90')
				const output = Style.generate(Utility.class, {width: `${prop}%`})

				const screens = Object.entries(theme('container.screens', theme('screens')) as Record<string, string>) as [string, string][]
				const step = - 20 / screens.length
				let width = step
				for (const [, size] of screens) {
					if (typeof size !== 'string') continue;
					const rules = Style.generate(Utility.class, {
						width: `${prop + width}%`,
					})
					for (const rule of rules) {
						output.push(rule.atRule(`@media (min-width: ${size})`))
					}
					width += step
				}
				return output
			})
			addVariant('hocus', ({modifySelectors}) => {
				return modifySelectors(({className}) => {
					return `.${className}:hover, .${className}:focus`;
				});
			})
			addVariant('hocus-in', ({modifySelectors}) => {
				return modifySelectors(({className}) => {
					return `.${className}:hover, .${className}:focus-within`;
				});
			})
			return
		}),
	],
})
