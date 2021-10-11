import {defineBuildConfig} from 'unbuild'

export default defineBuildConfig({
	declaration: true,
	clean: true,
	inlineDependencies: false,
	entries: [
		{
			input: 'src',
			name: 'index',
		},
	],
})
