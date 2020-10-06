<template>
	<section class="flex flex-col items-center">
		<section class="hero w-full h-52 py-8 flex flex-col justify-center items-center">
			<p class="text-3xl font-bold my-1">
				{{ t("hero") }},
				<span class="iconify" data-icon="ant-design:robot-outlined" data-inline="false"></span>
				!
				<span class="animate-blink">_</span>
			</p>
			<p class="text-lg font-semibold my-1 w-4/5 sm:w-3/5 md:w-2/5 text-justify">{{ t("IO LAB") }}{{ t("herotext") }}</p>
		</section>
	</section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
export const { t } = useI18n({ inheritLocale: true });
</script>

<style lang="postcss" scoped>
.hero {
	@apply bg-teal-400 text-white;
}
</style>

<i18n lang="yaml">
en:
 hero: "Hi there"
 herotext: "Welcome to world!"

zh-CN:
 hero: "你好"
 herotext: "是来自天津工业大学, 一个兴趣导向的专业社团. 我们致力于带领实验室社区了解最前沿的知识, 实践最潮流的技术, 为热爱技术的人提供一个互相沟通, 帮助, 协力的平台."
</i18n>
