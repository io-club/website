<template>
	<router-view v-slot="{Component}">
		<transition @before-enter="before" :css="false">
			<component :is="Component" />
		</transition>
	</router-view>
</template>

<script setup="props" lang="ts">
import { message } from "ant-design-vue";
import { inject } from "vue";

const { $ts: t } = inject("i18n") || {};
export const before = () => {
	message.loading(t("loading_tip"), 1);
};
</script>
