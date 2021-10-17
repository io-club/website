import type {Meta} from '@ioclub/mdvue'

type Toc = NonNullable<Meta['toc']>

import {defineComponent} from 'vue'
 
export default defineComponent({
	props: {'toc': Object as Toc},
	setup(props) {
		const generateMenu = (i_current?: Toc) => {
			const value = i_current?.value;
			const id = i_current?.id;
			if (!i_current?.children) {
				return <li class="px-2 my-1 border-l-3 text-gray-600 bg-gray-0
                        
                        transition duration-500 ease-in-out text-gray-600 
                        hover:text-light-blue-400 hover:border-green-700 hover:bg-light-blue-50 hover:hand
                        "
				style="user-select: none;"
				>
					<a href={`#${id}`}>{value}</a>
				</li>
			} else {
				return <div>
					<div class="hover(hand) " >
						<div style="user-select: none;">
							<div class="transition duration-300 ease-in-out text-gray-800 hover:text-light-blue-400"
								onClick={() => document.getElementById('submenu' + id)?.toggleAttribute('hidden')}
							>
								{`⯈ ${value}`}
							</div>
							<ul id={`submenu${id}`} class= "mx-5 hover(hand)">
								{i_current?.children?.map(x => generateMenu(x))}
							</ul>
						</div>
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
