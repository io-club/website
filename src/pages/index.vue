<template>
	<div
		class="
			bg-light-blue-800 bg-hero-circuit-board-white
			text-white
			relative
			h-72
		"
	>
		<div
			class="
				w-full
				h-full
				absolute
				t-0
				l-0
				opacity-50
				animate-bg400
				bg-rainbow bg-400
				z-0
			"
		></div>
		<div
			class="
				mx-auto
				w-48
				h-48
				flex
				justify-center
				items-center
				perspect-800px perspect-origin-top-right
			"
		>
			<div
				class="
					select-none
					w-24
					h-24
					preserve-3d
					relative
					animate-rotate360
					children:(
					border-4 border-purple-500
					opacity-80
					font-bold
					flex
					justify-center
					items-center
					transform
					absolute
					w-full
					h-full)
				"
				@click="animation"
			>
				<div class="bg-pink-500 translate-z-12">
					{{ i18n.home.cube[0] }}
				</div>
				<div class="bg-blue-500 rotate-y-180 translate-z-12">
					{{ i18n.home.cube[1] }}
				</div>
				<div class="bg-yellow-500 rotate-y-90 translate-z-12">
					{{ i18n.home.cube[2] }}
				</div>
				<div class="bg-green-500 -rotate-y-90 translate-z-12">
					{{ i18n.home.cube[3] }}
				</div>
				<div class="bg-red-500 rotate-x-90 translate-z-12">
					{{ i18n.home.cube[4] }}
				</div>
				<div class="bg-gray-500 -rotate-x-90 translate-z-12">
					{{ i18n.home.cube[5] }}
				</div>
			</div>
		</div>
		<a href="/register" class="block w-max mx-auto group relative">
			<div
				class="
					h-full
					w-full
					absolute
					t-0
					l-0
					bg-white
					transition-all
					duration-500
					origin-left
					group-hover:(bg-black
					animate-expandX)
					rounded
					z-1
				"
			></div>
			<div
				class="
					z-2
					text-black
					group-hover:text-white
					py-2
					px-3
					text-3xl
					relative
				"
			>
				{{ i18n.home.join_us }}
			</div>
		</a>
	</div>

	<div id="about" class="py-3 px-2">
		<div class="ratio-85 mx-auto children:mt-4">
			<div class="w-max mx-auto">
				<p class="text-2xl border-b-4 text-stroke-1 uppercase inline-block">
					{{ i18n.home.about_us.title }}
				</p>
			</div>
			<div
				class="flex <md:flex-wrap flex-row-reverse justify-around items-center"
			>
				<img
					src="@/assets/images/logo.png"
					class="<md:max-w-3/5 md:max-w-1/3"
				/>
				<div class="<md:w-full md:max-w-2/4">
					<p class="text-lg text-black-500">
						{{ i18n.home.about_us.sub_title }}
					</p>
					<p
						:key="p"
						v-for="p in i18n.home.about_us.description"
						class="text-sm leading-loose text-gray-700"
					>
						{{ p }}
					</p>
				</div>
			</div>
		</div>
	</div>

	<div id="show" class="py-6 px-2 bg-gray-700 text-white">
		<div class="ratio-85 mx-auto children:my-4">
			<div class="w-max mx-auto">
				<p class="text-2xl border-b-4 text-stroke-1 uppercase inline-block">
					{{ i18n.home.section.title }}
				</p>
			</div>
			<div class="grid grid-cols-2 <md:grid-cols-1 justify-center items-center">
				<div
					:key="p.brand"
					v-for="p in i18n.home.section.content"
					class="
						py-4
						flex flex-wrap
						justify-center
						items-center
						even:(flex-row-reverse)
					"
				>
					<p
						class="
							text-xl
							bg-gray-600
							text-white text-center
							py-6
							px-4
							mx-4
							rounded
						"
					>
						{{ p.brand }}
					</p>
					<div class="w-5/8">
						<p class="text-xl text-center">{{ p.title }}</p>
						<p class="text-light-700">{{ p.desc }}</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div id="photo" class="py-3 px-2">
		<div class="ratio-85 mx-auto children:mt-4">
			<div class="text-center">
				<p class="text-2xl border-b-4 text-stroke-1 uppercase inline-block">
					{{ i18n.home.photo.title }}
				</p>
			</div>
			<div class="grid grid-cols-auto gap-2 justify-center">
				<img src="@/assets/images/home/1.jpg" />
				<img src="@/assets/images/home/2.jpg" />
				<img src="@/assets/images/home/3.jpg" />
				<img src="@/assets/images/home/4.jpg" />
				<img src="@/assets/images/home/5.jpg" />
				<img src="@/assets/images/home/6.jpg" />
				<img src="@/assets/images/home/7.jpg" />
				<img src="@/assets/images/home/8.jpg" />
				<img src="@/assets/images/home/9.jpg" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { useI18n } from "vue-composable"
import Logo from "@/components/logo.vue"

export default defineComponent({
	async setup() {
		const { i18n } = useI18n()

		async function animation() {
			console.log("clicked")
		}

		return {
			Logo,
			i18n,
			animation,
		}
	},
})
</script>
