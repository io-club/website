<template>
	<a-spin :spinning="loading" :wrapperClassName="`flex-col ${classes}`" size="large">
		<div class="flex-col flex-grow flex-center p4">
			<a-textarea v-model:value="value" :placeholder="t('paste_tip')" class="flex-grow w60 my2" />
			<a-button-group>
				<a-button type="default" @click="submit">{{t('submit')}}</a-button>
				<a-popconfirm
					:title="t('are_you_sure')"
					:ok-text="t('yes')"
					:cancel-text="t('no')"
					@confirm="reset"
				>
					<a-button type="danger">{{t('reset')}}</a-button>
				</a-popconfirm>
			</a-button-group>
		</div>
	</a-spin>
</template>

<script setup="props" lang="ts">
import { h, inject, ref } from "vue";
import { Button, notification } from "ant-design-vue";
import { useFetch } from "vue-composable";

declare const props: {
	class?: string;
	id?: string;
};

export const classes = props.class;
export const { $ts: t } = inject("i18n") || {};
const { exec, status, text, json, error, cancel } = useFetch();

export const value = ref("");
export const loading = ref(true);

if (props.id && props.id !== "") {
	exec(`/api/pastebin/${props.id}`).then(() => {
		if (status.value === 200) {
			value.value = json.value.content;
		}
		loading.value = false;
	});
} else loading.value = false;

import copy from "copy-to-clipboard";
export const submit = async () => {
	loading.value = true;
	try {
		cancel();
	} catch (err) {
		console.error(err);
	}

	await exec("/api/pastebin", {
		method: "POST",
		mode: "cors",
		headers: {
			"Content-Type": "text/plain",
		},
		body: value.value,
	});
	if (status.value === 200) {
		const link = `${window.location.origin}/pastebin/${text.value}`;
		notification.success({
			message: t("succeed"),
			description: t("paste_description", { link }),
			duration: null,
			btn: () => {
				return h(
					Button,
					{
						type: "primary",
						size: "small",
						onClick: () => {
							copy(link);
							notification.close(link);
						},
					},
					t("copy")
				);
			},
			key: link,
		});
	} else {
		notification.error({
			message: t("fail"),
			description: error,
		});
	}
	loading.value = false;
};

export const reset = () => {
	text.value = "";
};
</script>
