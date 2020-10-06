<template>
	<section class="flex flex-col justify-center items-center mt-16">
		<p>made by {{ toc }}</p>
		<p>made by {{ attributes }}</p>
		<router-view v-model:toc="toc" v-model:attributes="attributes" />
	</section>
</template>

<script async setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
export const { t } = useI18n({ inheritLocale: true });

export const toc = ref(null);
export const attributes = ref(null);
</script>
