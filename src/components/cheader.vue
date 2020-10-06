<template>
	<header class="header flex flex-row items-center justify-center">
		<router-link class="flex flex-shrink-0 w-1/5" to="/#">
			<img class="brand-logo" src="/src/logo.svg" />
			<span class="brand-text">{{ t("IO LAB") }}</span>
		</router-link>
		<nav class="flex items-center justify-end flex-row w-3/5">
			<template v-for="l in menu" :key="l.text">
				<router-link v-if="!l.dropdown" :to="l.link" class="menu-link animate-underline">{{ t(l.text) }}</router-link>
				<router-link
					v-else
					:to="l.link"
					class="menu-link"
					@mouseover="hover[l.text] = true"
					@mouseleave="hover[l.text] = false"
				>
					{{ t(l.text, l.dropdown.length) }}
					<span
						class="iconify"
						data-icon="ic:sharp-keyboard-arrow-down"
						data-inline="false"
					></span>
					<div class="dropdown flex flex-col" v-if="hover[l.text]">
						<router-link
							v-for="d in l.dropdown"
							:key="d.text"
							to="#"
							@click="locale = d.text"
							class
						>{{ t(d.label) }}</router-link>
					</div>
				</router-link>
			</template>
		</nav>
	</header>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed, reactive } from "vue";

export const { locale, availableLocales } = useI18n();

export const menu = computed(() => {
	return [
		{
			text: "home",
			link: "#",
		},
		{
			text: "test",
			link: "#",
		},
		{
			text: "tt",
			link: "#",
		},
		{
			text: "language",
			link: "#",
			dropdown: availableLocales.map((t: string) => {
				return {
					label: "_" + t,
					text: t,
					link: t,
				};
			}),
		},
	];
});

export const { t } = useI18n({ inheritLocale: true });

export const hover = reactive({});
</script>

<style lang="postcss" scoped>
.header {
	@apply bg-white border-b shadow;
	@apply w-full px-6 py-3;
	@apply text-gray-800;
}

.brand-logo {
	@apply h-8 w-8 mr-4;
}

.brand-text {
	@apply font-semibold text-xl tracking-tight md:tracking-wider;
	@apply hidden sm:inline-block;
}

.animate-underline {
	@apply duration-200;
	transition-property: border-bottom-width;

	&:enter {
		@apply border-b-2 border-blue-400;
	}
}

.menu-link {
	@apply font-semibold text-base p-2 mx-2;
	@apply text-gray-500;

	&:enter {
		@apply text-gray-800;
	}

	.dropdown {
		@apply absolute mt-2;
		@apply p-2;
		@apply bg-white rounded border shadow;
	}
}
</style>
