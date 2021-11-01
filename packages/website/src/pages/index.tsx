import {defineComponent} from 'vue'

import Image from '~/components/image'
import Link from '~/components/link'
import {useI18n} from '~/plugins/i18n'

export default defineComponent({
	setup() {
		const {i18n} = useI18n()
		return () => {
			const {cube, join_us, about_us, section, photo} = i18n.value.home
			const ret = []

			ret.push(
				<div
					w:pos="relative"
					w:bg="rainbow 400"
					w:animate="bg400"
				>
					<div
						w:w="full"
						w:h="full"
						w:pos="absolute t-0 l-0"
						w:bg="hero-circuit-board-white-80"
						w:z="0"
					></div>
					<div w:p="y-8" w:children="my-4">
						<div
							w:m="x-auto"
							w:w="48"
							w:h="48"
							w:flex="~"
							w:justify="center"
							w:align="items-center"
							w:transform="perspect-800px perspect-origin-top-right"
						>
							<div
								w:select="none"
								w:w="24"
								w:h="24"
								w:transform="preserve-3d"
								w:pos="relative"
								w:animate="rotate360"
								w:children="border-4 border-purple-500 opacity-80 font-bold flex justify-center items-center transform absolute w-full h-full"
								onClick={(e) => console.log(3, e)}
							>
								<div w:bg="pink-500" w:transform="translate-z-12">
									{cube[0]}
								</div>
								<div w:bg="blue-500" w:transform="rotate-y-180 translate-z-12">
									{cube[1]}
								</div>
								<div w:bg="yellow-500" w:transform="rotate-y-90 translate-z-12">
									{cube[2]}
								</div>
								<div w:bg="green-500" w:transform="-rotate-y-90 translate-z-12">
									{cube[3]}
								</div>
								<div w:bg="red-500" w:transform="rotate-x-90 translate-z-12">
									{cube[4]}
								</div>
								<div w:bg="gray-500" w:transform="-rotate-x-90 translate-z-12">
									{cube[5]}
								</div>
							</div>
						</div>
						<Link
							to="/register"
							w:display="block"
							w:w="max"
							w:m="x-auto"
							w:pos="relative"
							class="group"
						>{() => [
								<div
									class="group-hover:(bg-black animate-expandX)"
									w:h="full"
									w:w="full"
									w:pos="absolute t-0 l-0"
									w:bg="white"
									w:transition="all duration-500"
									w:transform="origin-left"
									w:border="rounded"
									w:z="1"
								></div>,
								<div
									class="group-hover:text-white"
									w:text="black 3xl"
									w:p="y-2 x-3"
									w:display="relative"
									w:z="2"
								>
									{join_us}
								</div>,
							]}
						</Link>
					</div>
				</div>
			)

			const about_us_p = []
			for (const p of about_us.description) {
				about_us_p.push(
					<p w:text="sm gray-600 indent" w:font="leading-loose">
						{p}
					</p>
				)
			}
			ret.push(
				<div id="about"
					w:p="y-4 x-oi-6 x-os-5 x-o"
					w:children="mt-4"
				>
					<p w:text="2xl stroke-1 uppercase" w:border="b-4" w:w="max" w:m="x-auto">
						{about_us.title}
					</p>
					<div w:flex="~ wrap" w:justify="around" w:align="items-center" w:md="flex-nowrap flex-row-reverse">
						<Image src='/logo.png' w:w="max-3/5 md:max-1/3" />
						<div w:w="full md:max-2/4">
							<p w:text="center black-500">
								{about_us.sub_title}
							</p>
							{about_us_p}
						</div>
					</div>
				</div>
			)

			const section_p = []
			for (const p of section.content) {
				section_p.push(
					<div
						w:p="y-4"
						w:flex="~ wrap"
						w:justify="center"
						w:align="items-center"
						w:even="flex-row-reverse"
					>
						<p
							w:bg="gray-600"
							w:text="xl white center"
							w:p="y-6 x-4"
							w:m="x-4"
							w:border="rounded"
						>
							{p.brand}
						</p>
						<div w:w="5/8">
							<p w:text="xl center">{p.title}</p>
							<p w:text="light-700">{p.desc}</p>
						</div>
					</div>
				)
			}

			ret.push(
				<div id="show"
					w:bg="gray-700"
					w:text="white"
					w:p="y-4 x-oi-6 x-os-5 x-o"
					w:children="my-4"
				>
					<p w:text="2xl stroke-1 uppercase" w:border="b-4" w:w="max" w:m="x-auto">
						{section.title}
					</p>
					<div w:grid="~ cols-2 <md:cols-1" w:justify="center" w:align="items-center">
						{section_p}
					</div>
				</div>
			)

			const imgs = []
			for (let i = 1; i < 10; i++) {
				imgs.push(<Image src={`/images/home/${i}.jpg`} />)
			}
			ret.push(
				<div id="photo"
					w:p="y-4 x-oi-6 x-os-5 x-o"
					w:children="my-4"
				>
					<p w:text="2xl stroke-1 uppercase" w:border="b-4" w:w="max" w:m="x-auto">
						{photo.title}
					</p>
					<div w:grid="~ cols-auto md:cols-3 gap-2" w:justify="center">
						{imgs}
					</div>
				</div>
			)

			return <div>{ret}</div>
		}
	},
})
