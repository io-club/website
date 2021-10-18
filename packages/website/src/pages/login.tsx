
import { useI18n } from '@ioclub/composable'
import NQQ from 'virtual:icons/icon-park-outline/tencent-qq'
import NGithub from 'virtual:icons/uim/github-alt'
import { defineComponent, ref } from 'vue'

import Icon from '~/components/icon'
import Link from '~/components/link'
import LoginCode from '~/components/login/lcode'
import LoginPassword from '~/components/login/lpassword'
export default defineComponent({

	setup() {
		const { i18n } = useI18n()
		const loginwayIndex = ref(0)
		return () => {	
			const loginways = [
				{
					id: 0,
					title: '密码登录',
					slot: <LoginPassword/>
				}, {
					id: 1,
					title: '免密登录',
					slot: <LoginCode/>
				}
			]
			const lists = loginways.map((x) => {
				return <div 
					class={loginwayIndex.value == x.id ? 'bg-gray-200 border-b-3 border-b-gray-400 ' : ''} 
					onClick={() => {loginwayIndex.value = x.id}}
				>
					<span>{x.title}</span>
				</div>
			});
			
			return <div
				w:w="100"
				w:m="20"
				w:p="8"
				w:border="1 rounded"
				w:children='mt-4'
			>
				<div w:text="center"><span w:text="2xl stroke-1">Login</span></div>
				<div
					w:flex="~ row nowrap"
					w:children="p-2 text-sm borde-gray-200 border-b-3">
					{lists}
					<div w:flex='grow' w:border='gray-200 b-3' ><span></span></div>
				</div>

				{(() => {return loginways[loginwayIndex.value].slot})()}
				<div  
					w:m='b-2'
					w:text="center"
				>
					<span w:text="xs gray-500">don't have an account ? </span>
					<span w:text='xs green-800' w:cursor='pointer'><Link to='/register'>Register</Link></span>
				</div>
				<div
					w:flex="~ col"
					w:align="items-center"
					w:justify="around">
						
					<div  w:m='b-2'>
						<span w:text="sm gray-500">―――   or sign up using  ―――</span>
					</div>
					<div
						hidden="hidden"
						w:flex="~ row"
						w:children="mx-5"
					>
						<Icon desc="Github"><NGithub /></Icon>
						<Icon desc="QQ"><NQQ /></Icon>
					</div>
				</div>
			</div>
		}
	}
})

