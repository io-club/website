import 'toastify-js/src/toastify.css'

import Toastify from 'toastify-js'
export default function aaa(text: string, bgcolor?:string) {
	Toastify({
		text: text,
		duration: 2000,
		close: true,
		gravity: 'top',
		position: 'right',
		stopOnFocus: true,
		backgroundColor: bgcolor ?? 'linear-gradient(to right, #facc15, #fb923c)',
	}).showToast();
}