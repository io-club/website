// uno.config.ts
import {
	defineConfig,
	presetAttributify,
	presetIcons,
	presetTypography,
	presetUno,
	presetWebFonts,
	transformerDirectives,
	transformerVariantGroup,
	transformerAttributifyJsx,
} from 'unocss'
import type { Theme } from '@unocss/preset-uno'

function generate360() {
	const r: Record<string, unknown> = {}
	const c = 4

	let x = 720
	const x_step = -x / c

	let y = 0
	const y_step = 360 / c

	let z = 0
	const z_step = 360 / c

	for (let v = 100, v_step = v / c; v >= 0; v -= v_step) {
		r[`${v}%`] = {
			transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
		}
		if (v === 0) {
			break
		}

		r[`${v - 1}%`] = {
			transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
		}
		r[`${v - 0.7}%`] = {
			transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg) scale(1.2)`,
		}
		r[`${v - 0.5}%`] = {
			transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
		}
		r[`${v - 0.3}%`] = {
			transform: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg) scale(1.1)`,
		}

		x += x_step
		y += y_step
		z += z_step
	}

	return { rotate360: r }
}

export default defineConfig<Theme>({
	shortcuts: [
		// ...
	],
	theme: {
		colors: {
			// ...
		},
		dropShadow: {
			pig: '-32px -1px rgb(0 0 0 / 0.05)',
		},
		animation: {
			keyframes: {},
		},
	},
	presets: [
		presetUno({
			prefix: 'w-',
		}),
		presetIcons(),
		presetTypography(),
		presetWebFonts({
			fonts: {
				// ...
			},
		}),
		presetAttributify(),
	],
	transformers: [transformerDirectives(), transformerVariantGroup(), transformerAttributifyJsx()],
})
