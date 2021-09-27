# dfdf

fg

<script lang="ts">
import { defineComponent } from "vue"
import { useI18n } from "vue-composable"

export default defineComponent({
	layout: 'pages',
	async setup() {
		const { i18n } = useI18n()

		return {
			i18n,
		}
	},
})
</script>
