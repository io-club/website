<template>
	<a-spin :spinning="loading" :wrapperClassName="classes" size="large">
		<router-view v-slot="{Component}">
			<transition @before-enter="before" @after-enter="after" :css="false">
				<component :is="Component" />
			</transition>
		</router-view>
	</a-spin>
</template>

<script setup="props" lang="ts">
import { ref } from "vue";

declare const props: {
	class?: string;
};

export const classes = props.class;
export const loading = ref(false);
export const before = () => {
	loading.value = true;
};
export const after = () => {
	setTimeout(() => (loading.value = false), 200);
};
</script>
