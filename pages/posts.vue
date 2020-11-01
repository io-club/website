<template>
	<a-row type="flex" justify="center">
		<a-col :xs="22" :sm="19">
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
		<a-col :xs="0" :sm="5" class="relative px2">
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

export const router = useRouter();

export const p = reactive({
	attr: {},
	toc: {},
});
provide("page", p);

export const { $ts: t } = inject("i18n") || {};

import { Item } from "/@/components/nested-menu";
const navItems: Record<string, Item> = inject("navItems") || {};
const br = inject("breakpoints") || {};
watchEffect(() => {
	if (br.sm) {
		delete navItems.toc;
	} else {
		navItems.toc = {
			type: "group",
			label: t("toc"),
			children: p.toc,
		};
	}
});

onBeforeUnmount(() => {
	delete navItems.toc;
});
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
