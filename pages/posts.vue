<template>
	<a-row type="flex" justify="center">
		<a-col :xs="22" :md="19">
			<a-page-header :title="p.attr.title" :sub-title="p.attr.subtitle" @back="router.back()">
				<a-descriptions layout="vertical">
					<a-descriptions-item key="author" :label="t('author')">{{p.attr.author || t('noname')}}</a-descriptions-item>
					<a-descriptions-item key="license" :label="t('license')">
						<License :license="p.attr.license" />
					</a-descriptions-item>
					<a-descriptions-item key="last_modified" :label="t('last_modified')">{{p.attr.last_modified}}</a-descriptions-item>
					<a-descriptions-item
						key="description"
						:label="t('description')"
					>{{p.attr.description || t('default_desc')}}</a-descriptions-item>
				</a-descriptions>
				<template #footer></template>
			</a-page-header>
			<div class="px4 py1 markdown">
				<router-view />
			</div>
		</a-col>
		<a-col :xs="0" :md="5" class="relative px2">
			<NestedMenu
				:items="p.toc"
				mode="inline"
				:i18n="false"
				class="sticky overflow-x-auto overflow-y-auto t0 max-vh100"
			/>
		</a-col>
	</a-row>
</template>

<script setup lang="ts">
export { default as NestedMenu } from "/@/components/nested-menu";
export { default as License } from "/@/components/license.vue";
import { inject, onBeforeUnmount, provide, reactive, watchEffect } from "vue";
import { useRouter } from "vue-router";

provide("components", {});

export const router = useRouter();

export const p = reactive({
	attr: {},
	toc: [],
});
provide("page", p);

import { I18nType } from "/@/composables/i18n";
export const { $ts: t } = inject("i18n") as I18nType;

import { BreakpointType } from "/@/composables/breakpoints";
const br = inject("breakpoints") as BreakpointType;

import { Item } from "/@/components/nested-menu";
const navItems = inject("navItems") as Item[];

const removeToc = () => {
	const idx = navItems.findIndex((v) => v.label === "toc");
	if (idx !== -1) {
		navItems.splice(idx, 1);
	}
};
const addToc = () => {
	removeToc()
	navItems.push({
		label: "toc",
		type: "group",
		children: p.toc,
	});
};

watchEffect(() => {
	if (br.sm) {
		removeToc();
	} else {
		addToc();
	}
});

onBeforeUnmount(removeToc);
</script>

<style>
@import "katex/dist/katex.min.css";
@import "highlight.js/scss/monokai-sublime.scss";
</style>

<style lang="less">
@import "main";

.markdown {
	.footnotes {
		hr {
			margin-top: @s6;
			margin-bottom: @s6;
		}
	}

	img {
		display: block;
		margin-left: auto;
		margin-right: auto;
	}

	b,
	strong {
		color: @color-nord10;
	}

	ol {
		list-style-type: decimal;
	}

	ul {
		list-style-type: circle;
	}

	a {
		text-decoration: underline;
	}

	.hb (@i, @j) when (@i > 0) {
		h@{i}:before {
			content: @j;
		}
	}
	.hb(1, "#");
	.hb(2, "##");
	.hb(3, "###");
	.hb(4, "####");
	.hb(5, "#####");

	.katex-display .katex {
		.max-w100();
		overflow-x: auto;
		overflow-y: hidden;
	}
}
</style>
