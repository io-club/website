<template>
	<a-result status="404" title="404" :sub-title="t('404')">
		<template #extra>
			<a-button type="primary" @click="router.back()">{{t('back')}}</a-button>
		</template>
	</a-result>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { inject } from "vue";

export const router = useRouter();
export const { $ts: t } = inject("i18n") || {};
</script>
