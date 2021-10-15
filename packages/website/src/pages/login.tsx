
import { useI18n } from '@ioclub/composable'
import NQQ from 'virtual:icons/icon-park-outline/tencent-qq'
import NEmail from 'virtual:icons/mdi/email'
import NGithub from 'virtual:icons/uim/github-alt'
import { defineComponent } from 'vue'

import Imgwithdesc from '~/components/login/imgwithdesc'
import PasswordLogin from '~/components/login/npassword'
export default defineComponent({

	setup() {
		const {i18n} = useI18n()

		return () => {
			const ret = []

			ret.push(
				<div
					w:h="100"
					w:w="100"
					w:border="1 rounded"
				>	
					<PasswordLogin/>
					<div
						w:w="100"
						w:flex="~ col"
						w:align="items-center"
						w:justify="around"
					>
						<div><span w:text="8 gray-500">Or Sign Up Using</span></div>
						<div
							w:flex="~ row"
							w:children="mx-5"
						>
							<Imgwithdesc desc="邮箱"><NEmail/></Imgwithdesc>
							<Imgwithdesc desc="Github"><NGithub /></Imgwithdesc>
							<Imgwithdesc desc="QQ"><NQQ /></Imgwithdesc>
						</div>
					</div>
				</div>
			)
			return ret
		}
	}
})

