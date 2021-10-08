import { defineComponent } from 'vue'
import { useI18n } from 'vue-composable'

export default defineComponent({
	setup() {
		const { i18n } = useI18n()
		return () => {
			const ret = []
            const generateCards = () => {
                let ret = []
                let i = 0
                for (i; i < 10; i++) {
                    ret.push(
                        <div class="grid grid-cols-[6fr,1fr,1fr,1fr,1fr] grid-rows-1 place-content-center justify-center align-center">
                            <div class="topic my-auto p-5 justify-center align-center">
                                <div class="title">这是一个话题</div>
                                <div class="tag font">
                                    <span class="text-blue-300">■ </span>
                                    <span class="text-gray-400">language </span>
                                    <span class="text-green-300">■ </span>
                                    <span class="text-gray-400">libs</span>
                                </div>
                            </div>
                            <div class="author m-auto justify-center align-center">
                                <span class="text-gray-400">发起人</span>
                            </div>
                            <div class="replies m-auto justify-center align-center  font-weight-800">
                                <span class="text-gray-400">回复量</span>
                            </div>
                            <div class="views m-auto justify-center align-center">
                                <span class="text-gray-400">查看量</span>
                            </div>
                            <div class="activity m-auto justify-center align-center">
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
