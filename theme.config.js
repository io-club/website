/* eslint-disable @typescript-eslint/no-var-requires */

const {ThemeManager, Theme} = require('tailwindcss-theming/dist/api');

const palette = {
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
	// From iterm2-material-design
	black: '#546e7a',
	red: '#ff5252',
	green: '#5cf19e',
	yellow: '#ffd740',
	blue: '#40c4ff',
	magenta: '#ff4081',
	cyan: '#65fcda',
	white: '#eceff1',

	lblack: '#b0bec5',
	lred: '#ff8a80',
	lgreen: '#b9f6ca',
	lyellow: '#ffe57f',
	lblue: '#80d8ff',
	lmagenta: '#ff80ab',
	lcyan: '#a7fdeb',
	lwhite: '#fcfcfc',
};

// The light theme.
// prettier-ignore
const light = new Theme()
	.addColors({
		...palette,

		'ba': palette.lwhite,
		'bb': palette.nord6,
		'bc': palette.nord5,
		'bd': palette.nord4,
		'fa': palette.nord3,
		'fb': palette.nord2,
		'fc': palette.nord1,
		'fd': palette.nord0,

		'txt': palette.nord0,
	})

// The dark theme.
// prettier-ignore
const dark = new Theme()
	.addColors({
		...palette,
	})

module.exports = new ThemeManager()
	.setDefaultTheme(light.targetable())
	.setDefaultLightTheme(light.setName('light').targetable())
	.setDefaultDarkTheme(dark.setName('dark').targetable())
