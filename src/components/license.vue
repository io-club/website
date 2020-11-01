<template>
	<a rel="license" :href="`//creativecommons.org/licenses/${license}/4.0/`">
		<img :src="`/cc/${size || 'small'}/${license}.svg`" />
	</a>
</template>

<script setup="props" lang="ts">
declare const props: {
	license: string;
	size?: string;
};
</script>
