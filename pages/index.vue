<template>
	<section>
		<a-carousel autoplay class="bg-front fc-back py4">
			<div>
				<a-row type="flex" align="middle" justify="center">
					<a-col :xs="16" :sm="8" :md="6">
						<Beer class="block mx-auto w80" />
					</a-col>
					<a-col :xs="24" :sm="16" class="px4">
						<p class="text-center f3 f600">
							{{t('home_sli1_hero')}}
							<span class="animate-blink">_</span>
						</p>
						<p class="f2">{{t('home_sli1_sub')}}</p>
						<p :class="!br.sm ? 'text-center' : 'text-end'">
							<a-button-group>
								<a-button type="primary" disabled>{{t('join_us')}}</a-button>
								<a-button type="primary">
									<router-link to="/posts/about">{{t('learn_more')}}</router-link>
								</a-button>
							</a-button-group>
						</p>
					</a-col>
				</a-row>
			</div>
			<div>
				<a-row type="flex" align="middle" justify="center">
					<a-col :xs="16" :sm="8" :md="6">
						<Web class="block mx-auto w80" />
					</a-col>
					<a-col :xs="24" :sm="16" class="px4">
						<p class="text-center f3 f600">{{t('home_sli2_hero')}}</p>
						<p class="f2">{{t('home_sli2_sub')}}</p>
						<p :class="!br.sm ? 'text-center' : 'text-end'">
							<a-button type="primary">
								<a href="//github.com/xhebox/ioclub">
									<GithubOutlined />xhebox/ioclub
								</a>
							</a-button>
						</p>
					</a-col>
				</a-row>
			</div>
		</a-carousel>
	</section>
</template>

<script setup lang="ts">
export { default as Beer } from "/@/components/beer.vue";
export { VueComponent as Web } from "@mdi/svg/svg/web.svg";
export { GithubOutlined } from "@ant-design/icons-vue";
import { inject } from "vue";
export const br = inject("breakpoints") || {};
export const { $ts: t } = inject("i18n") || {};
</script>

<style>
</style>
