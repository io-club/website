import {defineComponent} from 'vue'

export default defineComponent({
	props: ['license'],
	setup(props) {
		return () => {
			if (!props.license) return ''
			return <a rel="license" href={`http://creativecommons.org/licenses/${props.license}/4.0/`}><img src={`/cc/${props.license}.svg`} /></a>
		}
	}
})
