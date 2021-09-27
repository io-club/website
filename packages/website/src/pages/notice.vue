<template>
	<div class="p-8">
		<vue-cal
			hide-view-selector
			active-view="month"
			clickToNavigate
			:disable-views="['week', 'day']"
			events-count-on-year-view="true"
			events-on-month-view="true"
			:events="events"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useI18n } from "vue-composable"
// @ts-ignore
import VueCal from "vue-cal"
import "vue-cal/dist/vuecal.css"

export default defineComponent({
	components: { "vue-cal": VueCal },
	async setup() {
		const { i18n } = useI18n()

		const events = [
			{
				start: "2018-11-20 14:00",
				end: "2018-11-20 18:00",
				title: "Need to go shopping",
				icon: "shopping_cart", // Custom attribute.
				content: "Click to see my shopping list",
				contentFull:
					"My shopping list is rather long:<br><ul><li>Avocados</li><li>Tomatoes</li><li>Potatoes</li><li>Mangoes</li></ul>", // Custom attribute.
				class: "leisure",
			},
			{
				start: "2018-11-22 10:00",
				end: "2018-11-22 15:00",
				title: "Golf with John",
				icon: "golf_course", // Custom attribute.
				content: "Do I need to tell how many holes?",
				contentFull: "Okay.<br>It will be a 18 hole golf course.", // Custom attribute.
				class: "sport",
			},
		]

		return {
			i18n,
			events,
		}
	},
})
</script>
