module.exports = {
	locales: {
		'/': {
			lang: 'zh-CN',
			title: 'I/O Lab',
			description: '天工大 I/O 实验室'
		},
		'/en': {
			lang: 'en-US',
			title: 'I/O Lab',
			description: 'TJPU I/O Lab'
		}
	},

	head: [
		['meta', {name: 'theme-color', content: '#3eaf7c'}],
		['meta', {name: 'apple-mobile-web-app-capable', content: 'yes'}],
		['meta', {name: 'apple-mobile-web-app-status-bar-style', content: 'black'}]
	],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
	themeConfig: {
		repo: '',
		editLinks: false,
		docsDir: '',
		editLinkText: '',
		lastUpdated: false,
		nav: [
			{
				text: '加入IO',
				link: '/apply/'
			},
		],
		sidebar: {
			'/guide/': [
				{
					title: 'Guide',
					collapsable: false,
					children: [
						'',
						'using-vue',
					]
				}
			],
		}
	},

	plugins: [
		'@vuepress/back-to-top',
		'@vuepress/pwa',
		['@vuepress/search', {
			searchMaxSuggestions: 5
		}],
		['graysite', {
			startDate: '2020-04-03 00:00:00',
			endDate: '2020-04-04 23:59:59'
		}],
	]
};
