<template>
	<section>
		<Banner />
	</section>
</template>

<script setup lang="ts">
export { default as Banner } from "./banner";
</script>

<style lang="less">
@import "main";

.slick-track {
	.flex-col();
	.justify-center();
}
</style>
