const p = {
	locales: {
		en: 'English',
		'zh-CN': '简体中文'
	},
	common: {
		title: 'IO实验室',
		loading_tip: '加载中...',
		header: {
			home: '首页',
			about: '关于',
			notice: '通知',
			forum: '论坛',
			login: '登录',
		},
		footer: {
		},
	},
	login: {
		errormsg: {
			nouser: '没有该用户',
			loginerror: '登录失败',
			registererror: '注册失败',
			codeerror: '验证码错误',
			network: '网络异常',
			sendcode: '发送验证码失败',
			resend: '重新发送',
			hassend: '验证码以发送至',
			checkEP: '请检查你的邮箱或手机号',
			checkIP: '请检查你的ID或邮箱'
		},
		problem: {
			hasaccount: '已有账号？',
			noaccount: '没有帐号？',
			nocode: '没有收到验证码？',
			forgetpasswd: '忘记密码？',
		},
		illegal: {
			username: '用户名格式不符',
			eorp: '邮箱或手机号格式不符',
			passwd: '密码不能为空',
			samepasswd: '两次密码不一致',
			email: '邮箱格式不符'
		},
		loginway: {
			choose: '选择您的登录方式',
			change: '改用其他登录方式',
			passwd: '使用密码登录',
			eorp: '使用邮箱或手机号登录'
		},
		common: {
			login: '登录',
			register: '注册'
		},
		laststep: {
			laststep: '上一步',
			changeaccount: '换用其他帐号',
			changeeorp: '修改邮箱/手机号',
			changeusername: '修改用户名',
			changepasswd: '修改密码',
		},
		nextstep: {
			nextstep: '下一步',
			sendcode: '发送验证码',
		},
		placeholder: {
			eorp: '输一手邮箱或手机号',
			username: '输一手用户名',
			code: '输一手验证码',
			passwd: '输一手密码',
			passwd2: '再输一手密码',
			email: '输一手邮箱',
		},
		title: {
			inputcode: '输入验证码',
			inputpasswd: '输入密码',
			inputemail: '填写邮箱',
		}
	},
	home: {
		join_us: '加入我们',
		cube: [
			'I/O',
			'CLUB',
			'2021',
			'HACK',
			'FUN',
			'CODING',
		],
		about_us: {
			title: 'about us',
			sub_title: '软硬件综合实验室',
			description: [
				'IO实验室成立于2013年, 是极客汇聚之地. 我们热衷于做好玩有趣的项目, 不管是软件编程, 还是DIY硬件.',
				'我们向初学者和老手教授各个领域的课程; 免费给硬件玩家提供相关设备; 每周都会举行技术分享座谈; 偶尔也会出去团建.',
				'另外, 整个实训B408都是社团的活动场地, 供平日见面和大小活动.',
			]
		},
		section: {
			title: 'awards & activities',
			content: [
				{
					brand: '2013',
					title: '华北五省大学生机器人大赛',
					desc: '社团早期围绕机器人, 参加了以华北五省机器人大赛为代表的多项比赛, 荣获海量大小奖项.',
				},
				{
					brand: '分享',
					title: '不仅仅是编程',
					desc: '每周一次分享会, 或线下, 或线上, 不限话题. 不管是编程, 算法, 机器人, 单片机, 机器学习; 还是数学, 英语, 物理, 化学; 甚至是生活体验, 聊天吹水.',
				},
				{
					brand: '2017',
					title: '全国互联网应用创新大赛',
					desc: '从2017年左右开始, 社团开始参加服务外包, 华北五省计算机应用大赛, 物联网创新与工程应用设计大赛等软件类比赛, 夺得大量奖项.',
				},
				{
					brand: '课程',
					title: '初学者的入门课程',
					desc: '分为前端, 后端, 单片机三门课程. 每门课程大约八节左右容量, 以开拓视野/引导入门为主要目的. 会对自学能力强, 学习进度快的人开小灶.',
				},
				{
					brand: '2020',
					title: '服务外包创新创业大赛',
					desc: '社团彻底转型为软硬件综合社团, 积极参加服务外包, 华北五省, 互联网+, 大学生创新创业项目, 新工科等比赛.',
				},
				{
					brand: '实践',
					title: '成长最快的途径',
					desc: '每年组织参加校内服务外包, 华北五省等比赛; 大学生创新创业项目等工程项目; 也会分享校外公司举办的竞赛活动, 偶尔组织参加.',
				},
			],
		},
		photo: {
			title: 'photo',
		},
	} as Record<string, any>,
	'languages': '语言',
	'language: {0}': '当前语言: {0}',
	'submit': '提交',
	'reset': '重置',
	'paste_tip': '请在此处粘贴你的文本!',
	'join_us': '加入我们',
	'untitled': '无题',
	'blog': '博客',
	'username': '用户名',
	'password': '密码',
	'pyterm': 'py终端',
	'pastebin': '便利贴',
	'more': '更多',
	'user': '用户',
	'last_modified': '最后修改',
	'description': '简介',
	'are_you_sure': '确定吗?',
	'yes': '是',
	'no': '否',
	'paste_description': '链接: {link}',
	'succeed': '成功!',
	'fail': '失败!',
	'license': '协议',
	'copy': '复制',
	'404': '你所访问的页面不存在',
	'prog_intro': '程序结构导论',
	'noname': '无名',
	'back': '返回',
	'toc': '目录',
	'author': '作者',
	'tools': '工具',
	'blog_guide': '博文导航',
	'default_desc': '这个人很懒, 什么都没有写',
	'learn_more': '了解更多',
	'home_sli1_hero': '欢迎你, 这里是极客汇集之地',
	'home_sli2_hero': '建设网站!',
	'home_sli2_sub': '本站源码已开源在github上, 一起来做网站吧! 不管是你的学习笔记, 还是分享一篇好文, 或者更酷: 使用vue3改变整个网站.',
	'home_sec2_hero': '这是什么实验室?',
	'home_sec2_sub': 'IO是由TJPU学生组织的社团. 我们喜欢做些好玩有趣的软件, 亲自上手DIY硬件. 另外, 整个实训B408都被社团包场, 供平日见面和大小活动.',
	'home_sec3_hero': '全新导论课程!',
	'home_sec3_sub': '崭新的编程导论课程, 享受网站实时交互的体验吧! 每年IO都会向一年级新生开设课程, 而且这次会更好: 更多的材料, 更多的交流, 更多的练习.',
	'home_sec4_hero': '免费硬件开发板',
	'home_sec4_sub': 'IO会向成员提供一些免费的硬件开发板, STM32这样的嵌入式板子, 树莓派, 甚至是FPGA的开发板. 学习硬件不再担心成本! 不过要珍惜这些开发板哦.',
	'home_sec5_hero': '我想问...?',
	'home_sec5_sub': '有一个FAQ页面, 你可以在导航栏上点击关于, 或者点击下面的这个链接: '
}
export default p as typeof p
