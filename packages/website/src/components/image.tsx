import { defineComponent } from 'vue'

import props from '@/utils/props'
import screens from '@/utils/screens'

export default defineComponent({
	props: {
		...props,
		src: {
			type: String,
			required: true,
		},
		alt: String,
	},
	setup(props) {
		return () => {
			const src = []
			for (const v of Object.values(screens)) {
				for (const p of ['webp', 'avif', 'png']) {
					src.push(<source srcset={`/api/service/image?url=${props.src}&width=${v.slice(0, v.length-2)}&format=${p}`} media={`(max-width: ${v})`} type={`image/${p}`} />)
				}
			}
			return <picture {...props}>
				{src}
				<img src={props.src} alt={props.alt} />
			</picture>
		}
	},
})
