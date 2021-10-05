import { defineComponent} from 'vue'
import type {TocEntry} from '@ioclub/mdvue'
 
export default defineComponent({
	props: {'toc': Object as TocEntry},
	setup(props) {
        const generateMenu = (i_current?: TocEntry) => {
            const value = i_current?.value;
            const id = i_current?.id;
            if (!i_current?.children) {
                return <li class="px-2 my-1 border-l-3 text-gray-600
                        hover:(border-green-700 text-blue-500 bg-gray-50 hand) "
                        style="user-select: none;"
                        >
                    <a href={`#${id}`}>{value}</a>
                </li>
            } else {
                return <div>
                    <div class="hover(hand) " >
                        <div style="user-select: none;"
                            onClick={() => document.getElementById("submenu" + id)?.toggleAttribute("hidden")}>
                            {`⯈ ${value}`}
                        </div>
                        <ul id={`submenu${id}`} class= "mx-5 hover(hand)">
                            {i_current?.children?.map(x => generateMenu(x))}
                        </ul>
                    </div>
                </div>
            } 
        }
        return () => {
            return <div>
                {generateMenu(props.toc)}
            </div>
        }
    },
})