/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
	purge: {
		enabled: process.env.NODE_ENV === 'production',
		content: [
			'./src/**/*',
		],
	},
	theme: {
		extend: {
			animation: {
				'blink': 'blink 1s linear infinite',
			},
			keyframes: {
				blink: {
					'0%, 49%': {opacity: 1},
					'50%, 100%': {opacity: 0},
				},
			},
			height: {
				72: '18rem',
				80: '20rem',
				88: '22rem',
				96: '24rem',
			},
			opacity: {
				10: '0.1',
				85: '0.85',
			},
		},
	},
	variants: {
		padding: ['first'],
		display: ['responsive'],
		cursor: ['responsive', 'disabled'],
		backgroundColor: ['dark', 'hover', 'disabled'],
		borderColor: ['dark', 'active', 'focus', 'disabled'],
		textColor: ['dark', 'hover', 'active', 'disabled'],
		opacity: ['dark', 'hover', 'active', 'focus', 'disabled'],
	},
	future: {
		purgeLayersByDefault: true,
		removeDeprecatedGapUtilities: true,
	},
	experimental: {
		darkModeVariant: true,
		applyComplexClasses: true,
		uniformColorPalette: true,
		extendedSpacingScale: true,
		defaultLineHeights: true,
		extendedFontSizeScale: true,
	},
	dark: 'class',
}
