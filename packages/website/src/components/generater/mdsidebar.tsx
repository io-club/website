
import { defineComponent} from 'vue'
import type {TocEntry} from '@ioclub/mdvue'
 
export default defineComponent({
	props: {'toc': Object as TocEntry},
	setup(props) {
        const generateCards = () => {
            const ret = []
            for (var color of ['red', 'blue', 'green', 'yellow', 'purple']) {
                console.log(color)
                ret.push(
                    <div class="border border-light-blue-150 shadow rounded-md mb-4 p-4 max-w-sm w-full mx-auto">
                    <div class="animate-pulse flex space-x-4">
                        <div class="rounded-full bg-light-blue-200 h-12 w-12"></div>
                        <div class="flex-1 space-y-4 py-1">
                        <div class="h-4 bg-light-blue-200 rounded w-3/4"></div>
                        <div class="space-y-2">
                            <div class="h-4 bg-light-blue-200 rounded"></div>
                            <div class="h-4 bg-light-blue-200 rounded w-5/6"></div>
                        </div>
                        </div>
                    </div>
                    </div>
                )
            }
            

            return ret
        }
        return () => {
            return <div>
                {generateCards()}
            </div>
        }
    },
})