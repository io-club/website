import type { DefineComponent } from 'vue'

import IPhone from 'virtual:icons/flat-color-icons/iphone'
import { defineComponent } from 'vue'

import NButton from '~/components/login/nbutton'
import Input from '~/components/login/ninput'
import { useI18n } from '~/plugins/i18n'

export default defineComponent({
	setup() {
		const { i18n } = useI18n()
		const input = {
			field: '',
			sixinput: '      '
		}
		return () => {
			const { emailorphone, sixinput, button } = i18n.value.login
			return <div
				w:flex="~ col"
				w:w="full"
				w:align="items-center"
				w:justify="around"
			>
				<Input 
					value={input.field} 
					type="text" 
					label={emailorphone.label}
					msg={emailorphone.msg}
					placeholder={emailorphone.placeholder}
					onChange={(e) => input.field}
				>
					{{
						icon: () => <IPhone/>,
						rightbutton: () => <button w:w='20' 
							w:outline="none focus:(none)"
							w:border="~ l-green-400 r-0 t-0 b-0"
							w:p='l-2'
							onClick={async () => {
								const res = await $fetch('/api/user/login_begin', {
									method: 'POST',
									body: {
										type: 'email',
										email: input.field,
									}
								})
							}}
						>{button.sendcode}</button>
					}}
				</Input>

				<Input
					value={input.sixinput}
					msg={sixinput.msg}
					label={sixinput.label}
					class="tracking-2.5em"
					w:bg="digit sz-digit repeat-x bottom"
					onChange={(e) => input.sixinput = e}
				/>

				<NButton p="1 x-20" type="button" value={button.login}
					onClick={() => {
						console.log('按下登录按钮');
					}}
				/>
			</div>
		}
	},
})


