import 'toastify-js/src/toastify.css'

import Toastify from 'toastify-js'
export default function aaa(text: string, bgcolor?: 'warning' | 'success' | 'danger') {
	const color = () => {
		switch (bgcolor) {
		case 'success':
			return 'linear-gradient(to right, #84cc16, #65a30d)'
		case 'warning':
			return 'linear-gradient(to right, #facc15, #eab308)'
		case 'danger':
			return 'linear-gradient(to right, #ef4444, #dc2626)'
		case undefined:
			return 'linear-gradient(to right, #facc15, #eab308)'
		}
	}
	Toastify({
		text: text,
		duration: 2000,
		close: true,
		gravity: 'top',
		position: 'right',
		stopOnFocus: true,
		backgroundColor: color(),
	}).showToast();
}