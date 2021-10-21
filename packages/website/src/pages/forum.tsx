import {useI18n} from '~/plugins/i18n'
import {defineComponent} from 'vue'

export default defineComponent({
	setup() {
		const {i18n} = useI18n()
		return () => {
			const ret = []
			const generateCards = () => {
				const ret = []
				let i = 0
				for (i; i < 10; i++) {
					ret.push(
						<div 
							w:grid="~ cols-[6fr_1fr_1fr_1fr_1fr] rows-1 "
							w:justify="center"
							w:align="center"
							w:place="content-center"
							w:children="my-auto p-5 justify-center align-center"
						>
							<div>
								<div class="title">这是一个话题</div>
								<div class="tag font">
									<span class="text-blue-300">■ </span>
									<span class="text-gray-400">language </span>
									<span class="text-green-300">■ </span>
									<span class="text-gray-400">libs</span>
								</div>
							</div>
							<div>
								<span class="text-gray-400">发起人</span>
							</div>
							<div class="font-weight-800">
								<span class="text-gray-400">回复量</span>
							</div>
							<div>
								<span class="text-gray-400">查看量</span>
							</div>
							<div>
								<span class="text-gray-400">上次更新时间</span>
							</div>
						</div>
					)
				}
				return ret
			}

			ret.push(
				<div class="w-full ">
					<div class="w-80/100 mx-auto grid grid-template-columns-none divide-y-2">
						<div class="grid grid-cols-[6fr,1fr,1fr,1fr,1fr] grid-rows-1  text-gray-400">
							<div class="title p-3 my-auto">
								<div class="content">Topic</div>
							</div>
							<div class="author m-auto">
								<span>author</span>
							</div>
							<div class="replies m-auto">
								<span>replies</span>
							</div>
							<div class="views m-auto">
								<span>views</span>
							</div>
							<div class="activity m-auto">
								<span>activity</span>
							</div>
						</div>
						<hr />
						{generateCards()}
					</div>
				</div>
			)
			return ret
		}
	},
})
