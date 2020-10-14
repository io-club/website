class Terminal {
	constructor(containerID, passed) {
		if (!containerID) return;

		this.options = {
			welcome: '',
			prompt: '',
			separator: '&gt;',
			theme: 'modern',
			...passed,
		};

		this._history = localStorage.history ? JSON.parse(localStorage.history) : [];
		this._histpos = this._history.length;
		this._histtemp = '';

		// Create terminal and cache DOM nodes;
		this._terminal = document.getElementById(containerID);
		this._terminal.classList.add('terminal');
		this._terminal.classList.add('terminal-' + this.options.theme);
		this._terminal.insertAdjacentHTML('beforeEnd', [
			'<div class="background"><div class="interlace"></div></div>',
			'<div class="container">',
			'<output></output>',
			'<table class="input-line">',
			'<tr><td nowrap><div class="prompt">' + this.options.prompt + this.options.separator + '</div></td><td width="100%"><input class="cmdline" spellcheck="false" autofocus /></td></tr>',
			'</table>',
			'</div>'].join(''));
		this._container = this._terminal.querySelector('.container');
		this._inputLine = this._container.querySelector('.input-line');
		this._cmdLine = this._container.querySelector('.input-line .cmdline');
		this._output = this._container.querySelector('output');
		this._prompt = this._container.querySelector('.prompt');
		this._background = document.querySelector('.background');

		// Hackery to resize the interlace background image as the container grows.
		this._output.addEventListener('DOMSubtreeModified', (e) => {
			this._cmdLine.scrollIntoView();
		}, false);

		if (this.options.welcome) {
			this.output(this.options.welcome);
		}

		window.addEventListener('click', (e) => {
			this._cmdLine.focus();
		}, false);

		this._output.addEventListener('click', (e) => {
			e.stopPropagation();
		}, false);

		// Always force text cursor to end of input line.
		this._cmdLine.addEventListener('click', (e) => this.inputTextClick(e), false);
		this._inputLine.addEventListener('click', (e) => {
			this._cmdLine.focus();
		}, false);

		// Handle up/down key presses for shell history and enter for new command.
		this._cmdLine.addEventListener('keyup', (e) => this.historyHandler(e), false);
		this._cmdLine.addEventListener('keydown', (e) => this.processNewCommand(e), false);

		window.addEventListener('keyup', (e) => {
			this._cmdLine.focus();
			e.stopPropagation();
			e.preventDefault();
		}, false);
	}

	inputTextClick(e) {
		this.value = `${this.value}`;
	}

	historyHandler(e) {
		// Clear command-line on Escape key.
		if (e.keyCode == 27) {
			this.value = '';
			e.stopPropagation();
			e.preventDefault();
		}

		if (this._history.length && (e.keyCode == 38 || e.keyCode == 40)) {
			if (this._history[this._histpos]) {
				this._history[this._histpos] = this.value;
			}
			else {
				this._histtemp = this.value;
			}

			if (e.keyCode == 38) {
				// Up arrow key.
				this._histpos--;
				if (this._histpos < 0) {
					this._histpos = 0;
				}
			}
			else if (e.keyCode == 40) {
				// Down arrow key.
				this._histpos++;
				if (this._histpos > this._history.length) {
					this._histpos = this._history.length;
				}
			}

			this.value = this._history[this._histpos] ? this._history[this._histpos] : this._histtemp;

			// Move cursor to end of input.
			this.inputTextClick()
		}
	}

	processNewCommand(e) {
		var cmdline = this.value;
		if (e.ctrlKey && e.keyCode == 68) {
			cmdline = 'EOF'
		} else if (e.keyCode != 13) return;
		e.preventDefault()

		if (cmdline && cmdline !== 'EOF') {
			this._history[this._history.length] = cmdline;
			localStorage['history'] = JSON.stringify(this._history);
			this._histpos = this._history.length;

			// Duplicate current input and append to output section.
			var line = this.parentNode.parentNode.parentNode.parentNode.cloneNode(true);
			line.removeAttribute('id')
			line.classList.add('line');
			var input = line.querySelector('input.cmdline');
			input.autofocus = false;
			input.readOnly = true;
			input.insertAdjacentHTML('beforebegin', input.value);
			input.parentNode.removeChild(input);
			this._output.appendChild(line);

			// Hide command line until we're done processing input.
			this._inputLine.classList.add('hidden');

			// Clear/setup line for next input.
			this.value = '';
		}

		// Parse out command, args, and trim off whitespace.
		if (cmdline) {
			var response = false;
			if (this.options.execute) response = this.options.execute(cmdline);
			if (response === false) response = 'command not found';
			this.output(response);
		}

		// Show the command line.
		this._inputLine.classList.remove('hidden');
	}

	clear() {
		this._output.innerHTML = '';
		this._cmdLine.value = '';
		this._background.style.minHeight = '';
	}

	output(html) {
		if (!html) html = '';
		this._output.insertAdjacentHTML('beforeEnd', html.replace(/ /g, '&nbsp;').replace(/\r?\n/g, '<br />'));
		this._cmdLine.scrollIntoView();
	}

	setPrompt(prompt) {
		this._prompt.innerHTML = prompt + this.options.separator
	}

	getPrompt() {
		return this._prompt.innerHTML.replace(new RegExp(this.options.separator + '$'), '')
	}

	setTheme(theme) {
		this._terminal.classList.remove('terminal-' + this.options.theme)
		this.options.theme = theme
		this._terminal.classList.add('terminal-' + this.options.theme)
	}

	getTheme() {
		return this.options.theme
	}
}
export default Terminal
