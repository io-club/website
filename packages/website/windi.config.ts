import hero from '@windicss/plugin-heropatterns'
import { defineConfig } from 'windicss/helpers'
import plugin from 'windicss/plugin'
import ratio from 'windicss/plugin/aspect-ratio'
import typography from 'windicss/plugin/typography'

import screens from './src/utils/screens'

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
		include: ['src/**/*.{vue,html,jsx,tsx}'],
	},
	darkMode: 'class',
	attributify: {
		prefix: 'w:',
	},
	theme: {
		fontFamily: {
			sans: ['Graphik', 'sans-serif'],
			serif: ['Merriweather', 'serif'],
		},
		screens,
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
				'digit': 'linear-gradient(to right, black 70%, transparent 70%)',
			},
			backgroundSize: {
				'sz-digit': '3.8em 2px',
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
			opacity: {
				default: '0.5',
				80: '0.8',
				100: '1.0',
			},
			includeThemeColors: true,
		}),
		plugin(function ({addVariant, addDynamic, theme}) {
			const autoRatio = {
				'px': ['padding-left', 'padding-right'],
				'mx': ['margin-left', 'margin-right'],
				'w': ['width'],
			}
			for (const [k, v] of Object.entries(autoRatio)) {
				const step = `--io-ratio-${k}-step`
				const init = `--io-ratio-${k}-init`

				addDynamic(`${k}-os`, ({Utility}) => {
					return Utility.handler.handleSpacing().handleNegative().handleSize().createProperty(step)
				})
				addDynamic(`${k}-oi`, ({Utility}) => {
					return Utility.handler.handleSpacing().handleSize().createProperty(init)
				})
				addDynamic(`${k}-o`, ({Utility, Style}) => {
					function generateStyle(e: number) {
						return v.reduce((p, n) => {
							p[n] = `calc(var(${init}) + ${e} * var(${step}))`
							return p
						}, {} as Record<string, string>)
					}
					const output = Style.generate(Utility.class, generateStyle(0))

					for (const [idx, size] of Object.values(theme('container.screens', theme('screens')) as Record<string, string>).entries()) {
						if (typeof size !== 'string') continue;

						const rules = Style.generate(Utility.class, generateStyle(idx+1))
						for (const rule of rules) {
							output.push(rule.atRule(`@media (min-width: ${size})`))
						}
					}

					return output
				})
			}
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
