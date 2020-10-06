<template>
	<footer class="footer items-center justify-center">
		<div class="flex flex-row items-center justify-between w-4/5 mx-auto">
			<i18n-t tag="p" keypath="made by {author}">
				<template #author>
					<span>@xhe</span>
				</template>
			</i18n-t>
		</div>
	</footer>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
export const { t } = useI18n({ inheritLocale: true });
</script>

<style lang="postcss" scoped>
.footer {
	@apply bg-gray-800 h-16;
	@apply w-full px-6 py-3 mt-6;
	@apply text-white;
}
</style>
