import { defineComponent } from 'vue'
import { useI18n } from 'vue-composable'

import logo from '@/assets/logo.png'

export default defineComponent({
	setup() {
		const { i18n } = useI18n()
		return () => {
			const {cube, join_us, about_us, section, photo} = i18n.value.home
			const ret = []

			ret.push(
				<div class="bg-light-blue-800 bg-hero-circuit-board-white text-white relative h-72">
					<div class="w-full h-full absolute t-0 l-0 opacity-50 animate-bg400 bg-rainbow bg-400 z-0"></div>
					<div class="mx-auto w-48 h-48 flex justify-center items-center perspect-800px perspect-origin-top-right">
						<div class="select-none w-24 h-24 preserve-3d relative animate-rotate360 children:(border-4 border-purple-500 opacity-80 font-bold flex justify-center items-center transform absolute w-full h-full)"
							onClick={(e) => console.log(3, e)}
						>
							<div class="bg-pink-500 translate-z-12">
								{ cube[0] }
							</div>
							<div class="bg-blue-500 rotate-y-180 translate-z-12">
								{ cube[1] }
							</div>
							<div class="bg-yellow-500 rotate-y-90 translate-z-12">
								{ cube[2] }
							</div>
							<div class="bg-green-500 -rotate-y-90 translate-z-12">
								{ cube[3] }
							</div>
							<div class="bg-red-500 rotate-x-90 translate-z-12">
								{ cube[4] }
							</div>
							<div class="bg-gray-500 -rotate-x-90 translate-z-12">
								{ cube[5] }
							</div>
						</div>
					</div>
					<a href="/register" class="block w-max mx-auto group relative">
						<div class="h-full w-full absolute t-0 l-0 bg-white transition-all duration-500 origin-left group-hover:(bg-black animate-expandX) rounded z-1"></div>
						<div class="z-2 text-black group-hover:text-white py-2 px-3 text-3xl relative">
							{ join_us }
						</div>
					</a>
				</div>
			)

			const about_us_p = []
			for (const p of about_us.description) {
				about_us_p.push(
					<p class="text-sm leading-loose text-gray-600 indent">
						{ p }
					</p>
				)
			}
			ret.push(
				<div id="about" class="py-3 px-oi-6 px-os-5 px-o children:mt-4">
					<p class="text-2xl border-b-4 text-stroke-1 uppercase w-max mx-auto">
						{ about_us.title }
					</p>
					<div class="flex flex-wrap justify-around items-center md:(flex-nowrap flex-row-reverse)">
						<img src={logo} class="max-w-3/5 md:max-w-1/3" />
						<div class="w-full md:max-w-2/4">
							<p class="text-center text-black-500">
								{ about_us.sub_title }
							</p>
							{about_us_p}
						</div>
					</div>
				</div>
			)

			const section_p = []
			for (const p of section.content) {
				section_p.push(
					<div class="py-4 flex flex-wrap justify-center items-center even:(flex-row-reverse)">
						<p class="text-xl bg-gray-600 text-white text-center py-6 px-4 mx-4 rounded">
							{ p.brand }
						</p>
						<div class="w-5/8">
							<p class="text-xl text-center">{ p.title }</p>
							<p class="text-light-700">{ p.desc }</p>
						</div>
					</div>
				)
			}

			ret.push(
				<div id="show" class="py-6 px-2 bg-gray-700 text-white">
					<div class="ratio-85 mx-auto children:my-4">
						<div class="w-max mx-auto">
							<p class="text-2xl border-b-4 text-stroke-1 uppercase inline-block">
								{ section.title }
							</p>
						</div>
						<div class="grid grid-cols-2 <md:grid-cols-1 justify-center items-center">
							{section_p}
						</div>
					</div>
				</div>
			)

			const imgs = []
			for (let i=1; i<10; i++) {
				imgs.push(<img src={`/images/home/${i}.jpg`} />)
			}
			ret.push(
				<div id="photo" class="py-3 px-2">
					<div class="ratio-85 mx-auto children:mt-4">
						<div class="text-center">
							<p class="text-2xl border-b-4 text-stroke-1 uppercase inline-block">
								{ photo.title }
							</p>
						</div>
						<div class="grid grid-cols-auto gap-2 justify-center">
							{imgs}
						</div>
					</div>
				</div>
			)

			return ret
		}
	},
})
