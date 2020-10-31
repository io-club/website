<template>
	<a-back-top />
	<main class="flex-col bg-lwhite fc-front min-h100">
		<a-drawer
			:title="t('IO LAB')"
			placement="left"
			v-model:visible="open"
			getContainer="body"
			width="80%"
		>
			<NestedMenu :items="items" mode="inline" />
		</a-drawer>
		<header class="flex-row align-center py0 px3 bg-back">
			<router-link class="flex-row align-center" to="/#">
				<logo class="h5" />
				<span v-if="br.sm" class="f2 ml0">{{ t('IO LAB') }}</span>
			</router-link>

			<span class="flex-grow" />

			<NestedMenu v-if="br.sm" :items="items" />
			<a-button v-else type="link" @click="open = !open">
				<MenuOutlined v-if="!open" />
				<CloseOutlined v-else />
			</a-button>
		</header>
		<SubView class="flex-grow" />
		<footer class="flex-row flex-center py2 px3 bg-front fc-back">
			<span v-if="br.sm">{{ t('language: {0}', [t(locale)]) }}</span>
			<a
				v-if="br.sm"
				:href="hitokoto.uuid ? `//hitokoto.cn?uuid=${hitokoto.uuid}` : '/#'"
				class="flex-grow text-center"
			>{{ hitokoto.word }} {{hitokoto.uuid ? '-' : ''}} {{hitokoto.from}}</a>
			<div class="flex-col flex-center">
				<span>@{{ new Date().getFullYear() }}</span>
				<span>{{ t('IO LAB') }}</span>
			</div>
		</footer>
	</main>
</template>

<script setup lang="ts">
import { provide, reactive, readonly, ref } from "vue";

// for logo
export { default as logo } from "/@/components/logo.vue";

// for loading
export { default as SubView } from "/@/components/subview.vue";

// for burger
export { MenuOutlined, CloseOutlined } from "@ant-design/icons-vue";
export const open = ref(false);

// global breakpoints
import breakpoints from "/@/breakpoints.json";
import { useBreakpoint, useFetch } from "vue-composable";
export const br = readonly(reactive(useBreakpoint(breakpoints)));
provide("breakpoints", br);

// global i18n
import { buildI18n, useLanguage } from "vue-composable";

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

export const { $ts: t, locale } = i18n;

// for header
export { default as NestedMenu } from "/@/components/nested-menu";
import { Item } from "/@/components/nested-menu";

const languages: Record<string, Item> = {};
i18n.locales.value.forEach((t) => (languages[t] = {}));

export const items: Record<string, Item> = reactive({
	home: { link: "/" },
	class: { link: "/posts/class/" },
	tools: {
		type: "sub",
		children: {
			pastebin: { link: "/pastebin/" },
			pyterm: { link: "/pyterm/" },
		},
	},
	about: { link: "/posts/about/" },
	languages: {
		type: "sub",
		children: languages,
		callback: (t) => (locale.value = t as typeof locale.value),
	},
});
provide("navItems", items);

// for footer
declare interface Hitokoto {
	word?: string;
	from?: string;
	uuid?: string;
}

export const hitokoto: Hitokoto = reactive({});

const { exec } = useFetch();
exec("//v1.hitokoto.cn?encode=json&charset=utf-8&max_length=16")
	.then((res) => res?.json())
	.then((data) => {
		hitokoto.word = data?.hitokoto?.replace("。", "").replace(".", "");
		hitokoto.from = data?.from;
		hitokoto.uuid = data?.uuid;
	});
</script>

<style lang="less">
@import "normalize.css";
@import "ant-design-vue/dist/antd.less";
@import "main";

body {
	fill: currentColor;
}

a {
	color: inherit;
}

.ant-menu {
	border: none;
	.bg-transparent();
}

.ant-spin-container {
	.flex-col();
	.flex-grow();
}

img {
	.max-w100();
}

code {
	background-color: #23241f;
	color: #fff;
	padding: 0 1px;
}
</style>
