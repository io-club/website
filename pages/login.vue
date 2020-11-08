<template>
	<a-row align="middle" justify="center">
		<a-col>
			<a-form :model="formdata" @submit.prevent="handleSubmit">
				<a-form-item>
					<a-input v-model:value="formdata.username" :placeholder="t('username')">
						<template #prefix>
							<UserOutlined style="color:rgba(0,0,0,.25)" />
						</template>
					</a-input>
				</a-form-item>
				<a-form-item>
					<a-input v-model:value="formdata.password" type="password" :placeholder="t('password')">
						<template #prefix>
							<LockOutlined style="color:rgba(0,0,0,.25)" />
						</template>
					</a-input>
				</a-form-item>
				<a-form-item>
					<a-button
						type="primary"
						html-type="submit"
						:disabled="formdata.username === '' || formdata.password === ''"
					>{{t('login')}}</a-button>
				</a-form-item>
			</a-form>
		</a-col>
	</a-row>
</template>

<script setup lang="ts">
import { inject, reactive } from "vue";
import { useFetch } from "vue-composable";
import { I18nType } from "/@/composables/i18n";

export { UserOutlined, LockOutlined } from "@ant-design/icons-vue";

export const formdata = reactive({
	username: "",
	password: "",
});

//const router = useRouter();
import { Item } from "/@/components/nested-menu";
const auth = inject("auth") as Item;

export const handleSubmit = async () => {
	if (auth.disabled || auth.label !== "login") {
		console.log(auth);
		return;
	}

	const { exec } = useFetch();
	const res = await exec("/api/auth/login", {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(formdata),
	})
	console.log(res)

	if (auth.callback) auth.callback("");
};

export const { $ts: t } = inject("i18n") as I18nType;
</script>
