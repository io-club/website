import { component$, useStore, useTask$ } from '@builder.io/qwik'
import { nanoid } from 'nanoid'
import { postprocess, parse, preprocess } from 'micromark'

type Node = { nodes: { key: string; node: Node }[]; props: Record<string, string> }

const Render = component$<{ node: Node }>(({ node }) => {
	let CustomTag = node.props.name as string
	const props: Record<string, unknown> = { text: node.props.text }
	if (CustomTag === 'autolink') {
		CustomTag = 'a'
		//return <a href={node.props.text ?? '/'} />
	} else if (CustomTag === 'h') {
		CustomTag += node.props.depth
	} else if (CustomTag === 'img') {
		props.alt = node.props.label
		props.src = node.props.dest
	} else if (CustomTag === 'article') {
		props.text = ''
	}
	return (
		<CustomTag {...props}>
			{props.text as string}
			{node.nodes.map(({ key, node }) => (
				<Render key={key} node={node} />
			))}
		</CustomTag>
	)
})

export default component$<{ text: string }>(({ text }) => {
	const stack = useStore([] as Node['nodes'])

	useTask$(() => {
		const chunks = preprocess()(text, null, true)
		const mast = postprocess(parse({}).document().write(chunks))

		const enterNode = (name: string) => {
			stack.push({
				key: nanoid(),
				node: {
					props: { name },
					nodes: [],
				},
			})
		}
		const exitNode = () => {
			const e = stack.at(-1)
			if (!e) return
			stack.pop()
			const l = stack.at(-1)
			if (!l) return
			l.node.nodes.push(e)
		}
		const setProp = (a: string, b: string) => {
			const e = stack.at(-1)
			if (!e) return
			e.node.props[a] = b
		}
		const getProp = (a: string) => {
			const e = stack.at(-1)
			if (!e) return null
			return e.node.props[a]
		}
		const appendText = (ev: (typeof mast)[0]) => {
			const e = stack.at(-1)
			if (!e) return
			e.node.props.text = (e.node.props.text ?? '') + ev[2].sliceSerialize(ev[1])
		}
		const appendTextOn = (t: string): ((ev: (typeof mast)[0]) => void) => {
			return (ev) => {
				const e = stack.at(-1)
				if (!e) return
				if (e.node.props.name !== t) return
				return appendText(ev)
			}
		}

		enterNode('article')

		type s = (ev: (typeof mast)[0]) => void
		const handlers: {
			enter: Record<string, s>
			exit: Record<string, s>
		} = {
			enter: {
				atxHeading() {
					enterNode('h')
				},
				characterEscapeValue() {
					enterNode('span')
				},
				data() {
					enterNode('span')
				},
				paragraph() {
					const p = getProp('name')
					enterNode(p === 'ul' || p === 'ol' ? 'li' : 'p')
				},
				listUnordered() {
					enterNode('ul')
				},
				listOrdered() {
					enterNode('ol')
				},
				autolink() {
					enterNode('autolink')
				},
				image() {
					enterNode('img')
				},
				blockQuote() {
					enterNode('blockquote')
				},
				codeText() {
					enterNode('code')
				},
				codeFenced() {
					enterNode('code')
					setProp('fenced', 'true')
				},
				strong() {
					enterNode('strong')
				},
				emphasis() {
					enterNode('em')
				},
			},
			exit: {
				autolinkProtocol: appendText,
				codeFlowValue: appendText,
				lineEnding: appendTextOn('code'),
				characterEscapeValue(ev) {
					appendText(ev)
					exitNode()
				},
				data(ev) {
					appendText(ev)
					exitNode()
				},
				codeTextData: appendText,
				atxHeading: exitNode,
				atxHeadingSequence(ev) {
					setProp('depth', ev[2].sliceSerialize(ev[1]).length.toString())
				},
				labelText(ev) {
					setProp('label', ev[2].sliceSerialize(ev[1]))
				},
				resourceDestination(ev) {
					setProp('dest', ev[2].sliceSerialize(ev[1]))
				},
				thematicBreak() {
					enterNode('br')
					exitNode()
				},
				image: exitNode,
				blockQuote: exitNode,
				codeText: exitNode,
				codeFenced: exitNode,
				strong: exitNode,
				emphasis: exitNode,
				paragraph: exitNode,
				listUnordered: exitNode,
				listOrdered: exitNode,
				autolink: exitNode,
			},
		}
		for (const ev of mast) {
			const h = handlers[ev[0]][ev[1].type]
			if (h) {
				h(ev)
			}
		}
	})

	return (
		<>
			{stack.map(({ key, node }) => (
				<Render key={key} node={node} />
			))}
		</>
	)
})
