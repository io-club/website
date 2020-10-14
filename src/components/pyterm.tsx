import 'xterm/css/xterm.css'

import {defineComponent, onMounted, reactive} from 'vue'
import xterm from 'xterm'

import pyodide from '../pyodide/pyodide.asm.js'
import wasm from '../pyodide/pyodide.asm.wasm'

declare interface InteractiveConsole {
	push(a: unknown): boolean;
	resetbuffer(): void;
}

declare interface Pyodide {
	runPython(a: string): unknown;
	pyimport(a: string): unknown;
	run(): unknown;
	con: InteractiveConsole;
}

export default defineComponent({
	props: {'id': {type: String, required: true}},
	setup(props) {
		const py = reactive({} as Pyodide)
		const term = new xterm.Terminal({
			fontFamily: 'Ubuntu Mono, courier-new, courier, Mononoki, monospace',
			fontSize: 16,
			cursorBlink: true,
			rendererType: 'canvas',
		})

		wasm().then(exports => {
			console.log(exports)
		})
			/*

		pyodide.then(() => {
			const pyodide = self.pyodide
			py.runPython = (e) => pyodide.runPython(e)
			py.pyimport = (e) => pyodide.pyimport(e)
			self.runPy = py.runPython
			py.runPython(`
import io, code, sys
from js import runPy
class Console(code.InteractiveConsole):
	def runcode(self, code):
		sys.stdout = io.StringIO()
		sys.stderr = sys.stdout
		runPy("\\n".join(self.buffer))
__c = Console(locals=globals())
`)
			py.con = py.pyimport('__c') as InteractiveConsole
			term.write('welcome to the pyterm\r\n> ')
		})
			 */

		onMounted(() => {
			const elem = document.getElementById(props.id)
			if (!elem) return

			term.open(elem)
			term.attachCustomKeyEventHandler((ev) => {
				if (ev.key === 'v' && ev.ctrlKey && !ev.altKey && !ev.shiftKey) {
					document.execCommand('paste');
					return false;
				}
				if (ev.altKey || ev.ctrlKey || ev.shiftKey) {
					return false;
				}
				if (ev.key === 'Escape') {
					term.blur()
				}
				return true;
			})
			term.onKey(({key, domEvent: ev}) => {
				if (!py.con) return

				const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
				const buffer = term.buffer.active

				if (ev.key === 'Enter' || (ev.ctrlKey && ev.key == 'd')) {
					term.write('\r\n')
				} else if (ev.key === 'Backspace') {
					if (buffer.cursorX > 2) {
						term.write('\b \b');
					}
					return
				} else if (ev.key == 'ArrowUp') {
					return
				} else if (printable) {
					term.write(key)
					return
				} else {
					return
				}

				const line = buffer.getLine(buffer.cursorY)?.translateToString(true).slice(2) || ''
				try {
					const result = py.con.push(line)
					if (!result) {
						const stdout = (py.runPython('sys.stdout.getvalue()') as string).replaceAll('\n', '\r\n')
						py.runPython('sys.stdout.truncate(0)')
						term.write(stdout)
						term.write('> ')
					} else {
						term.write('$ ')
					}
				} catch (e) {
					const stdout = `${e}`.trimEnd().replaceAll('\n', '\r\n')
					py.con.resetbuffer()
					term.write(stdout)
					term.write('\r\n> ')
				}
			})
			term.focus()
		})
		return () => <div id={props.id} />
	}
})
