import {defineComponent} from 'vue';

function random(min: number, max: number): string {
	return (Math.random() * (max - min) + min).toFixed(2)
}

export default defineComponent({
	setup() {
		const bubbles: JSX.Element[] = []
		for (let i = 0; i < 12; i++) {
			bubbles.push(
				<circle cx={random(15, 70)} cy="50" r={random(3, 6)} opacity={random(0.3, 0.5)} fill="#FFFFFF">
					<animateTransform attributeName="transform"
						type="translate"
						values={`${random(-5, 5)} ${random(30, 50)};${random(-10, 10)} -30;`}
						dur={`${random(2, 4)}s`}
						repeatCount="indefinite" />
				</circle>)
		}
		return () =>
			<svg viewBox="0 0 98 100">
				<defs>
					<mask id="a">
						<path fill="#fff" d="M0 0h98v100H0z" />
						<path d="M78.91 41.12c.8-4.4 8.8-5.08 9.87 0l-.18 25.59c-.56 3.65-8.95 3.99-9.68.02l-.01-25.61 78.91 41.12z" />
					</mask>
				</defs>
				<path fill="#FFF" d="M85.72 26.55h-7.46c1.7-5.51.54-11.75-3.04-15.98a19.69 19.69 0 00-14.9-6.76c-4.11 0-7.85 1.29-10.73 3.6C46.54 2.8 40.12.38 33.97.38c-7.05 0-14.16 3.22-16 10.32-1.15-.2-2.49-.35-3.9-.35C5.6 10.35.55 15.51.21 24.51c-.19 4.84 1.04 8.67 3.66 11.4A12.24 12.24 0 008.87 39v48.54a12.1 12.1 0 0012.08 12.08H64.3A12.1 12.1 0 0076.4 87.54v-9.37h9.32a12.1 12.1 0 0012.09-12.09V38.63a12.1 12.1 0 00-12.1-12.08z" mask="url(#a)" />
				<path fill="#FF9C08" d="M70.35 33.53C58.88 41.9 54.23 35.15 53 34.68c-2.21 2.71-6.74 6.94-13.57 7.17l-.7.01c-8.13.78-12.08-5.05-12.74-5.9a21.39 21.39 0 01-11.06 3.67v47.76c.08 5.03 4.37 6.03 6.03 6.03H64.3a6.06 6.06 0 006.04-6.04V33.53z" />
				{bubbles}
			</svg>
	}
})
