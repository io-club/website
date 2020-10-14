/* eslint-disable @typescript-eslint/no-var-requires */
const plugin = require('tailwindcss/plugin')
const theme = require('tailwindcss-theming')
const selectorParser = require('postcss-selector-parser')

module.exports = {
	purge: {
		enabled: process.env.NODE_ENV === 'production',
		content: [
			'./index.html',
			'./src/**/*.vue',
			'./src/**/*.tsx',
		],
	},
	theme: {
		screens: require('./src/breakpoints'),
		extend: {
			boxShadow: {
				outlblue: '0 0 0 3px rgba(var(--color-lblue), 1)',
			},
			animation: {
				'blink': 'blink 1s linear infinite',
				'easein': 'easein 1s ease-in',
				'easeout': 'easeout 1s ease-out',
				'rotate180': 'rotate180 1s ease-in',
			},
			keyframes: {
				rotate180: {
					'0%': {transform: 'rotate(0deg)'},
					'100%': {transform: 'rotate(180deg)'},
				},
				blink: {
					'0%, 49%': {opacity: 1},
					'50%, 100%': {opacity: 0},
				},
				easein: {
					'0%': {opacity: 0, transform: 'scale(0)'},
					'100%': {opacity: 1, transform: 'scale(1)'},
				},
				easeout: {
					'0%': {opacity: 1, transform: 'scale(1)'},
					'100%': {opacity: 0, transform: 'scale(0)'},
				},
			},
			height: {
				72: '18rem',
				80: '20rem',
				88: '22rem',
				96: '24rem',
			},
			maxWidth: {
				2: '0.5rem',
				4: '1rem',
				6: '1.5rem',
				8: '2rem',
				10: '2.5rem',
				12: '3rem',
				16: '4rem',
				18: '6rem',
				20: '8rem',
				22: '10rem',
				24: '12rem',
				26: '14rem',
				28: '16rem',
				30: '18rem',
				32: '20rem',
				34: '22rem',
				36: '24rem',
			},
			minWidth: {
				2: '0.5rem',
				4: '1rem',
				6: '1.5rem',
				8: '2rem',
				10: '2.5rem',
				12: '3rem',
				16: '4rem',
				18: '6rem',
				20: '8rem',
				22: '10rem',
				24: '12rem',
				26: '14rem',
				28: '16rem',
				30: '18rem',
				32: '20rem',
				34: '22rem',
				36: '24rem',
			},
			opacity: {
				10: '0.1',
				85: '0.85',
			},
			top: {
				'8': '2rem',
				'10': '2.5rem',
				'12': '3rem',
			},
		},
	},
	variants: {
		position: ['group_enter'],
		display: ['group_enter'],
		rotate: ['group_enter'],
		inset: ['group_enter'],
		animation: ['group_enter'],
		margin: ['children'],
		padding: ['children'],
		backgroundColor: ['enter'],
		outline: ['focus'],
		text: ['enter'],
		boxShadow: ['enter'],
	},
	future: {
		purgeLayersByDefault: true,
		removeDeprecatedGapUtilities: true,
	},
	experimental: {
		applyComplexClasses: true,
		extendedSpacingScale: true,
		extendedFontSizeScale: true,
	},
	plugins: [
		plugin(({addUtilities, addVariant, config, e}) => {
			const newUtilities = {
				'.flex-center': {
					'align-items': 'center',
					'justify-content': 'center',
				},
				'.flex-around': {
					'align-items': 'center',
					'justify-content': 'space-around',
				},
				'.flex-between': {
					'align-items': 'center',
					'justify-content': 'space-between',
				},
			}

			const duration = [75, 100, 150, 200, 300, 500, 700, 1000]
			for (const d of duration) {
				newUtilities[`.animate-${d}`] = {
					'animation-duration': `${d}ms`,
				}
			}

			addUtilities(newUtilities, ['group_enter'])

			const prefixClass = function (className) {
				const prefix = config('prefix');
				const getPrefix = typeof prefix === 'function' ? prefix : () => prefix;
				return `${getPrefix(`.${className}`)}${className}`;
			};

			addVariant('enter', ({modifySelectors, separator}) => {
				modifySelectors(({className}) => {
					return `.${e(`enter${separator}${className}`)}:enter`
				})
			})

			addVariant('group_enter', ({modifySelectors, separator}) => {
				modifySelectors(({selector}) => {
					return selectorParser(selectors => {
						selectors.walkClasses(sel => {
							sel.value = `group_enter${separator}${sel.value}`
							sel.parent.insertBefore(
								sel,
								selectorParser().astSync(`.${prefixClass('group')}:enter `)
							)
						})
					}).processSync(selector)
				})
			})
		}),
		theme({
			themes: 'theme.config.js',
		}),
		require('tailwindcss-children'),
	],
}
