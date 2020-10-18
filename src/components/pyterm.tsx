import 'xterm/css/xterm.css'

import localEchoController from '@fikrikarim/local-echo'
import {defineComponent, onMounted, ref} from 'vue'
import xterm from 'xterm'

import Loading from '/@/components/loading'
import init, * as rp from '/rustpython/rustpython_wasm.js'

export default defineComponent({
	props: {'id': {type: String, required: true}},
	setup() {
		const loading = ref(true)

		const elem = ref(null)
		onMounted(async () => {
			const term = new xterm.Terminal({
				fontFamily: 'Ubuntu Mono, courier-new, courier, Mononoki, monospace',
				fontSize: 16,
				cursorBlink: true,
				rendererType: 'canvas',
			})

			term.attachCustomKeyEventHandler((ev) => {
				if (ev.key === 'v' && ev.ctrlKey && !ev.altKey && !ev.shiftKey) {
					document.execCommand('paste');
					return false;
				}
				if (ev.altKey || ev.ctrlKey) {
					return false;
				}
				if (ev.key === 'Escape') {
					term.blur()
				}
				return true;
			})

			await init('/rustpython/rustpython_wasm_bg.wasm')
			const terminalVM = rp.vmStore.init('term_vm');

			const localEcho = new localEchoController(term);
			terminalVM.setStdout((data: unknown) => localEcho.print(data));
			const getPrompt = (name: string) => {
				terminalVM.exec(`
try:
    import sys as __sys
    __prompt = __sys.${name}
except:
    __prompt = ''
finally:
    del __sys
`);
				return String(terminalVM.eval('__prompt'));
			}

			const readPrompts = async () => {
				let continuing = false;

				for (; ;) {
					const ps1 = getPrompt('ps1');
					const ps2 = getPrompt('ps2');
					let input;
					if (continuing) {
						const prom = localEcho.read(ps2, ps2);
						localEcho._activePrompt.prompt = ps1;
						localEcho._input = localEcho.history.entries.pop() + '\n';
						localEcho._cursor = localEcho._input.length;
						localEcho._active = true;
						input = await prom;
						if (!input.endsWith('\n')) continue;
					} else {
						input = await localEcho.read(ps1, ps2);
					}
					try {
						terminalVM.execSingle(input);
					} catch (err) {
						if (err.canContinue) {
							continuing = true;
							continue;
						}
						localEcho.println(err);
					}
					continuing = false;
				}
			}
			readPrompts().catch(err => console.error(err));
			loading.value = false
			term.open(elem.value as unknown as HTMLElement)
			term.focus()
		})

		return () => <div class="flex flex-col flex-center">
			<div ref={elem} class="h-full w-full" />
			{loading.value ? <Loading /> : '' }
		</div>
	}
})
