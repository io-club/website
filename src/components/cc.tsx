import {defineComponent} from 'vue'

export default defineComponent({
	props: ['license'],
	setup(props) {
		return () => {
			if (props.license)
				return <a rel="license" href={`http://creativecommons.org/licenses/${props.license}/4.0/`}><img alt="license" src={`https://i.creativecommons.org/l/${props.license}/4.0/88x31.png`} /></a>
			else
				return ''
		}
	}
})
