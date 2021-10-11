import '@vue/runtime-dom'

declare module '@vue/runtime-dom' {
	interface HTMLAttributes extends JSX.CustomAttributes {
	}
}
