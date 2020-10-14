import {VueComponent as MdiDown} from '@mdi/svg/svg/chevron-down.svg'
import {defineComponent, reactive} from 'vue'

export declare interface TocEntry {
	depth: number;
	value: string;
	children?: TocEntry[];
	uuid: string;
}

export default defineComponent({
	props: ['toc'],
	setup(props) {
		const closed: Record<string, boolean> = reactive({})
		const generate = (p: TocEntry) => {
			console.log('e', p)
			if (!p) return

			const uuid = p.uuid
			const ret: JSX.Element[] = []
			if (p.depth) {
				const icon: JSX.Element[] = []
				if (p.children && p.children.length > 0) {
					icon.push(<MdiDown class={`w-5 h-5 inline-block transform transition-transform duration-100 ${closed[uuid] ? 'rotate-180' : ''}`} />)
				}
				ret.push(<button onClick={() => closed[uuid] = !closed[uuid]}>
					<span>{p.value}</span>
					{icon}
				</button>)
			}
			if (p.children && p.children.length > 0) {
				ret.push(<ul class={`pl-2 ${closed[uuid] ? 'hidden' : ''}`}>
					{p.children.map(v => <li>{generate(v)}</li>)}
				</ul>)
			}
			return ret
		}
		return () => <nav class="px-8 py-8 border-r border-bc">
			{generate(props.toc)}
		</nav>
	},
})
