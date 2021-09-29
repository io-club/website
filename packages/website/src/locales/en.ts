import type {i18n} from 'vue-composable'

export default {
	locales: {
		'en': 'English',
		'zh-CN': '简体中文'
	},
	common: {
		title: 'I/O CLUB',
		about: 'About',
		loading_tip: 'Loading...'
	},
	home: {
		about_us: {
			title: 'about uS',
			sub_title: 'Software/Hardware Comprehensive Laboratory',
			description: [
				'The club is created in 2013. This is where geek gathers. We love to create just4fun & hacking projects in both hardware and software.',
				'We teach lectures in various fields for both newbie and pro; offer free facilities for hardware hacker; raise weekly technique sharing; sometimes go out for team building :)',
				'Also, we have a room at CSB408 for regular meeting and activities.',
			],
		},
		section: [
			{
				title: 'awards',
				content: [
					{
						brand: '2013',
						title: '华北五省大学生机器人大赛',
						desc: '社团早期围绕机器人, 参加了以华北五省机器人大赛为代表的多项比赛, 荣获海量大小奖项.',
					},
					{
						brand: '2017',
						title: '全国互联网应用创新大赛',
						desc: '从2017年左右开始, 社团开始参加服务外包, 华北五省计算机应用大赛, 物联网创新与工程应用设计大赛等软件类比赛, 夺得大量奖项.',
					},
					{
						brand: '2020',
						title: '服务外包创新创业大赛',
						desc: '社团彻底转型为软硬件综合社团, 积极参加服务外包, 华北五省, 互联网+, 大学生创新创业项目, 新工科等比赛.',
					},
				],
			},
			{
				title: 'activities',
				content: [
					{
						brand: '2013',
						title: '华北五省大学生机器人大赛',
						desc: '社团早期围绕机器人, 参加了以华北五省机器人大赛为代表的多项比赛, 荣获海量大小奖项.',
					},
					{
						brand: '2017',
						title: '全国互联网应用创新大赛',
						desc: '从2017年左右开始, 社团开始参加服务外包, 华北五省计算机应用大赛, 物联网创新与工程应用设计大赛等软件类比赛, 夺得大量奖项.',
					},
					{
						brand: '2020',
						title: '服务外包创新创业大赛',
						desc: '社团彻底转型为软硬件综合社团, 积极参加服务外包, 华北五省, 互联网+, 大学生创新创业项目, 新工科等比赛.',
					},
				],
			},
		],
		photo: {
			title: 'photo',
		},
	} as Record<string, any>,
	'join_us': 'Join Us',
	'default_desc': 'This person is too lazy, nothing left here',
	'last_modified': 'Last Modified',
	'description': 'Description',
	'404': 'The page you visited does not existed',
	'back': 'Back',
	'submit': 'Submit',
	'blog': 'Blog',
	'license': 'License',
	'username': 'Username',
	'password': 'Password',
	'user': 'User',
	'login': 'Login',
	'more': 'More',
	'pyterm': 'PyTerm',
	'pastebin': 'PasteBin',
	'tools': 'Tools',
	'noname': 'No Name',
	'prog_intro': 'Program Structure Introduction',
	'paste_tip': 'Paste your text here!',
	'are_you_sure': 'Are you sure?',
	'succeed': 'Succeeded!',
	'fail': 'Failed!',
	'paste_description': 'Link: {link}',
	'yes': 'Yes',
	'copy': 'Copy',
	'no': 'No',
	'reset': 'Reset',
	'toc': 'Table Of Contents',
	'author': 'Author',
	'blog_guide': 'Blog Guide',
	'languages': 'Languages',
	'language: {0}': 'language: {0}',
	'learn_more': 'Learn More',
	'home_sli1_hero': 'Hi, this is where geeks gather',
	'home_sli2_hero': 'Build the website!',
	'home_sli2_sub': 'This website is open-sourced on github, try to improve the website together! Share your learning notes, write your articles, or even better: write vue3 code to change the whole site.',
	'home_sec2_hero': 'What is this lab?',
	'home_sec2_sub': 'It is a club created by students in TJPU. We love to create just4fun & hacking projects in both hardware and software. Also, we have a room at CSB408 for regular meeting and activities.',
	'home_sec3_hero': 'Say HI to new class!',
	'home_sec3_sub': 'This is a whole new introduction class on programming, powered by a interactive website! IO tried to teach the grade one every year, but we can made it better: more materials, more communications and more practices.',
	'home_sec4_hero': 'Free hardware boards',
	'home_sec4_sub': 'We provide members some free hardware development kit, embbedded boards like STM32, rasberry PI, or even FPGA. Remove the barrier of learning hardware! But be lovely to the boards.',
	'home_sec5_hero': 'May I ask ... ?',
	'home_sec5_sub': 'There is a FAQ page. You can check \'About\' on the top navigation bar, or just click the link here: '
	'untitled': '无题',
} as i18n
