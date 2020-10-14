<template>
	<div class="py-3 px-2 bg-white">
		<div class="ratio-94 mx-auto flex justify-between items-center">
			<a class="inline-flex items-center" href="#">
				<Logo class="max-w-10 mr-2" />
				<span href="#" class="text-2xl font-heavy">{{
					i18n.common.title
				}}</span>
			</a>
			<button class="md:hidden" type="button">menu</button>
			<nav class="<md:hidden w-3/4">
				<ul
					class="
						relative
						flex
						justify-around
						children:(border-b-2
						transition-transform
						transform
						duration-100)
					"
				>
					<li class="hover:scale-110">
						<a href="/#about">{{ i18n.common.header.about }}</a>
					</li>
					<li class="hover:scale-110">
						<a href="/notice">{{ i18n.common.header.notice }}</a>
					</li>
					<li class="text-gray-400">
						<a href="#">{{ i18n.common.header.forum }}</a>
					</li>
					<li class="text-gray-400">
						<a href="#">{{ i18n.common.header.login }}</a>
					</li>
				</ul>
			</nav>
		</div>
	</div>

	<slot />

	<div class="min-h-20 bg-gray-800 text-white flex items-center justify-center">
		<p>By &copy; 2021 I/O club All rights reserved</p>
	</div>
</template>

<script lang="ts">
import "virtual:windi.css"
import zh_CN from "@/locales/zh_CN"
import { setI18n } from "vue-composable"

import { defineComponent } from "vue"

export default defineComponent({
	props: ["name"],
	async setup() {
		const { i18n } = setI18n({
			locale: "zh_CN",
			fallback: "zh_CN",
			messages: {
				zh_CN,
				//en,
			},
		})
		return {
			i18n,
		}
	},
})
</script>

<style lang="postcss">
html {
	scroll-behavior: smooth;
	caret-color: transparent;
}
</style>
