<template>
	<div class="flex-col flex-center p4">
		<a-input-group>
			<a-textarea
				v-model:value="value"
				:placeholder="t('paste_tip')"
				:autosize="{minRows: 16, maxRows: 32}"
				class="flex-grow"
				allowClear
				showCount
			/>
		</a-input-group>
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

import { I18nType } from "/@/composables/i18n";
export const { $ts: t } = inject("i18n") as I18nType;

import { BreakpointType } from "/@/composables/breakpoints";
const br = inject("breakpoints") as BreakpointType;
export const width = () => {
	if (!br.sm) {
		return "w90";
	} else if (!br.md) {
		return "w80";
	} else {
		return "w60";
	}
};

export const value = ref("");
export const loading = ref(true);

const { exec, status, text, json, error, cancel } = useFetch();

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
