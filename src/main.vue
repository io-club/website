<template>
	<a-back-top />
	<main class="flex-col bg-lwhite fc-front min-h100">
		<header class="flex-row align-center py0 px3 bg-back">
			<router-link class="flex-row align-center" to="/">
				<logo class="h5" />
				<span v-if="br.sm" class="f2 ml0">{{ t('IO LAB') }}</span>
			</router-link>

			<span class="flex-grow" />

			<NestedMenu v-if="br.sm" :items="items" />
			<a-button v-else type="link" @click="open = !open">
				<a-drawer
					:title="t('IO LAB')"
					placement="left"
					v-model:visible="open"
					getContainer="body"
					width="80%"
				>
					<NestedMenu :items="items" mode="inline" />
				</a-drawer>
				<MenuOutlined v-if="!open" />
				<CloseOutlined v-else />
			</a-button>
		</header>
		<router-view class="flex-grow" />
		<footer class="flex-row flex-center py2 px3 bg-front fc-back">
			<span v-if="br.sm">{{ t('language: {0}', [t(i18n.locale)]) }}</span>
			<a
				v-if="br.sm"
				:href="hitokoto.uuid ? `//hitokoto.cn?uuid=${hitokoto.uuid}` : '/'"
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
import { provide, reactive, ref } from "vue";
import { useFetch } from "vue-composable";
export { default as logo } from "/@/components/logo.vue";
export { MenuOutlined, CloseOutlined } from "@ant-design/icons-vue";

// global breakpoints
import { useBreakpoint } from "/@/composables/breakpoints";
export const br = useBreakpoint();
provide("breakpoints", br);

// global i18n
import { useI18n } from "/@/composables/i18n";
export const i18n = useI18n();
provide("i18n", i18n);
export const { $ts: t } = i18n;

// for header
export { default as NestedMenu } from "/@/components/nested-menu";
import { Item } from "/@/components/nested-menu";

export const open = ref(false);

export const items: Item[] = reactive([
	{
		type: "sub",
		label: "blog",
		link: "/posts",
		children: [
			{
				label: "blog_guide",
				link: "/posts",
			},
			{
				label: "prog_intro",
				link: "/posts/prog_intro",
			},
		],
	},
	{
		label: "about",
		link: "/posts/about",
	},
	{
		type: "sub",
		label: "more",
		children: [
			{
				label: "pastebin",
				link: "/pastebin/",
			},
			{
				label: "pyterm",
				link: "/pyterm",
			},
			{
				type: "sub",
				label: "languages",
				children: i18n.locales.value.reduce((e, j) => {
					e.push({
						label: j,
						callback: () => (i18n.locale.value = j),
					});
					return e;
				}, [] as Item[]),
			},
		],
	},
]);
provide("navItems", items);

// for auth
const auth = reactive({
	label: "login",
	link: "/login",
	disabled: true,
	callback: async (e) => {
		if (e !== "") {
			return 
		}

		auth.disabled = true;

		const { exec: authFetch } = useFetch();
		const res = await authFetch("/api/auth/info", {
			credentials: "same-origin",
		});

		if (res?.status === 200) {
			auth.type = "sub";
			auth.label = "user";
		}

		auth.disabled = false;
	},
} as Item);
items.push(auth);
provide("auth", auth);
if (auth.callback)
	auth.callback("")

// for footer
declare interface Hitokoto {
	word?: string;
	from?: string;
	uuid?: string;
}

export const hitokoto: Hitokoto = reactive({});

const { exec: hitokotoFetch } = useFetch();
hitokotoFetch("//v1.hitokoto.cn?encode=json&charset=utf-8&max_length=16")
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
