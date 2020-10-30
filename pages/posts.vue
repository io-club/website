<template>
	<a-row type="flex" justify="center">
		<a-col :xs="22" :sm="19">
			<a-page-header
				:title="page.attributes.title"
				:sub-title="page.attributes.subtitle"
				@back="router.back()"
			>
				<template #extra>
					<License :license="page.attributes.license" />
				</template>
				<a-descriptions>
					<a-descriptions-item
						v-for="desc in page.attributes.descs"
						:key="desc.label"
						:label="t(desc.label)"
					>{{desc.value}}</a-descriptions-item>
				</a-descriptions>
			</a-page-header>
			<div class="px4 py1 markdown">
				<router-view />
			</div>
		</a-col>
		<a-col :xs="0" :sm="5" class="relative px2">
			<NestedMenu :items="page.toc" mode="inline" :i18n="false" class="sticky t0" />
		</a-col>
	</a-row>
</template>

<script setup lang="ts">
export { default as License } from "/@/components/license.vue";
export { default as NestedMenu } from "/@/components/nested-menu";
import { inject, provide, reactive, watchEffect } from "vue";
import { useRouter } from "vue-router";

export const router = useRouter();

export const page = reactive({
	attributes: {},
	toc: {},
});
provide("page", page);

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
			children: page.toc,
		};
	}
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
