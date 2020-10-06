<template>
	<main class="flex flex-col min-h-screen w-full">
		<cheader />
		<section class="flex-grow w-full">
			<router-view />
		</section>
		<cfooter />
	</main>
</template>

<style lang="postcss">
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

.iconify {
	@apply inline-block;
}
</style>
