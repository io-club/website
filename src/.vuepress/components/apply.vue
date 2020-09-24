<template>
	<section>
		<form action="https://api.staticforms.xyz/submit" method="post">
			<input type="hidden" name="accessKey" value="e6490ec5-c071-4ff6-afa8-9479e98a7096" />
			<input type="hidden" name="redirectTo" value="https://iolab.cf/apply_success" />

			<b-field label="姓名">
				<b-input name="name" placeholder="李华" required></b-input>
			</b-field>

			<b-field label="班级">
				<b-input name="$class" placeholder="物联2002" required></b-input>
			</b-field>

			<b-field label="QQ">
				<b-input name="$contact" placeholder="123456" required maxlength="128"></b-input>
			</b-field>

			<b-field label="特长">
				<b-input name="$special" maxlength="128"></b-input>
			</b-field>

			<b-input type="submit" value="加入IO"></b-input>
		</form>
	</section>
</template>

<script>
import "buefy/dist/buefy.css";

export default {
	data() {
		return {
			name: "John Silver",
		};
	},
	methods: {
		clickMe() {
			console.log(this);
		},
	},
};
</script>

<style lang="stylus"></style>
