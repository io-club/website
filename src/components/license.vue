<template>
	<a rel="license" :href="`//creativecommons.org/licenses/${license}/4.0/`" v-if="license">
		<img :src="`/cc/${license}.svg`" />
	</a>
</template>

<script setup="props" lang="ts">
declare const props: {
	license?: string;
}
</script>
