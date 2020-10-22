<template>
	<main class="flex flex-col w-full min-h-screen text-base font-normal fill-current bg-bb text-txt">
		<iheader />
		<router-view />
		<ifooter />
	</main>
</template>

<script setup lang="ts">
export { default as iheader } from "/@/components/i-header.tsx";
export { default as ifooter } from "/@/components/i-footer.tsx";

import breakpoints from "/@/breakpoints.json";
import { provide, reactive, readonly } from "vue";
import { useBreakpoint, buildI18n, useLanguage } from "vue-composable";

provide("breakpoints", readonly(reactive(useBreakpoint(breakpoints))));

const i18n = buildI18n({
	locale: "zh-CN",
	fallback: "en",
	messages: {
		en: async () => {
			const m = await import("/@/locales/en.json");
			return m.default;
		},
		"zh-CN": async () => {
			const m = await import("/@/locales/zh_CN.json");
			return m.default;
		},
	},
});
const userlocale = (i18n.locales.value as readonly string[]).indexOf(
	useLanguage().language.value
);
if (userlocale != -1) {
	i18n.locale.value = i18n.locales.value[userlocale];
}
provide("i18n", i18n);

export const { $ts: t } = i18n;
</script>

<style lang="scss">
@import "tailwindcss/base.css";

h1 {
	@apply text-5xl;
}

h2 {
	@apply text-4xl;
}

h3 {
	@apply text-3xl;
}

h4 {
	@apply text-2xl;
}

h5 {
	@apply text-xl;
}

h6 {
	@apply text-lg;
}

@import "tailwindcss/components.css";
@import "tailwindcss/utilities.css";

body {
	fill: currentColor;
}

code {
	background-color: #23241f;
	color: #fff;
	padding: 0 1px;
}
</style>
