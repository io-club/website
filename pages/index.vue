<template>
	<section>
		<Banner />
		<a-list
			item-layout="vertical"
			size="large"
			:pagination="pagination"
			:data-source="listData"
			class="p4"
		>
			<template v-slot:renderItem="{ item }">
				<a-list-item key="item.title">
					<a-list-item-meta :description="item.subtitle">
						<template v-slot:title>
							<a :href="item.href">{{ item.title }}</a>
						</template>
						<template v-slot:avatar>
							<a-avatar v-if="item.avatar" :src="item.avatar" />
							<a-avatar v-else>
								<template v-slot:icon>
									<UserOutlined />
								</template>
							</a-avatar>
						</template>
					</a-list-item-meta>
					{{ item.description }}
				</a-list-item>
			</template>
		</a-list>
	</section>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Meta } from "../lib/markdown";
export { default as Banner } from "./banner";
export { UserOutlined } from "@ant-design/icons-vue";
import { default as Pagination } from "./pagination";

export const listData = reactive([] as Record<string, unknown>[]);

const posts = Pagination as Meta[];
listData.splice(0);
for (const m of posts) {
	listData.push({
		href: `/posts/${m.path}`,
		...m.data,
	});
}

export const pagination = { pageSize: 5 };
</script>

<style lang="less">
@import "main";

.slick-track {
	.flex-col();
	.justify-center();
}
</style>
