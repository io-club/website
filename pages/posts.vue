<template>
	<a-row class="relative p6">
		<a-col :span="19">
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
			<div class="py1 markdown">
				<router-view />
			</div>
		</a-col>
		<a-col :span="5" class="sticky px2 t0">
			<NestedMenu :items="page.toc" mode="inline" :i18n="false" />
		</a-col>
	</a-row>
</template>

<script setup lang="ts">
export { default as License } from "/@/components/license.vue";
export { default as NestedMenu } from "/@/components/nested-menu";
import { inject, provide, reactive } from "vue";
import { useRouter } from "vue-router";

export const router = useRouter();

export const page = reactive({
	attributes: {},
	toc: [],
});
provide("page", page);

export const { $ts: t } = inject("i18n") || {};
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
}
</style>
