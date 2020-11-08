<template>
	<a-result status="404" title="404" :sub-title="t('404')">
		<template #extra>
			<a-button type="primary" @click="router.back()">{{t('back')}}</a-button>
		</template>
	</a-result>
</template>

<script setup="props" lang="ts">
import { useRouter } from "vue-router";
import { inject } from "vue";

declare const props: {
	all?: string;
};

export const router = useRouter();

if (props.all === 'pastebin') {
	router.push('/pastebin/')
}

import { I18nType } from "/@/composables/i18n";
export const { $ts: t } = inject("i18n") as I18nType;
</script>
