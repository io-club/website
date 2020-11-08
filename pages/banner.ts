import {GithubOutlined} from '@ant-design/icons-vue'
import {VueComponent as Web} from '@mdi/svg/svg/web.svg'
import {Button, Carousel, Col, Row} from 'ant-design-vue'
import {defineComponent, h, inject, VNode} from 'vue'
import {RouterLink} from 'vue-router'

import Beer from '/@/components/beer.vue'
import {BreakpointType} from '/@/composables/breakpoints'
import {I18nType} from '/@/composables/i18n';

export default defineComponent({
	setup() {
		const br = inject('breakpoints') as BreakpointType;
		const {$ts: t} = inject('i18n') as I18nType;

		return () => {
			const items = [
				{
					img: h(Beer),
					hero: [t('home_sli1_hero'), h('span', {class: 'animate-blink'}, '_')],
					sub: [t('home_sli1_sub')],
					extra: h(Button.Group, {},
						() => [
							h(Button, {type: 'primary', disabled: true}, () => t('join_us')),
							h(Button, {type: 'primary'}, () => h(RouterLink, {to: '/posts/about'}, () => t('learn_more'))),
						])
				},
				{
					img: h(Web),
					hero: [t('home_sli2_hero')],
					sub: [t('home_sli2_sub')],
					extra:
						h(Button, {type: 'primary'}, () => h('a', {href: '//github.com/xhebox/ioclub'}, [h(GithubOutlined), 'xhebox/ioclub']))
				},
			];

			return h(Carousel, {
				length: items.length,
				class: 'bg-front fc-back',
				autoplay: true,
				adaptiveHeight: true,
				infinite: false,
			}, () => items.map(v => {
				const cols: VNode[] = []
				cols.push(h(Col, {xs: 0, sm: 6, md: 5, lg: 4, xl: 3}, () => [v.img]))

				const col2: VNode[] = []
				col2.push(h('p', {class: `${!br.md ? 'text-center f2 f600' : 'f3 f600'}`}, v.hero))
				col2.push(h('p', {class: `${!br.md ? 'f1' : 'f2'}`}, v.sub))
				col2.push(h('p', {class: `${!br.md ? 'text-center' : 'text-end'}`}, v.extra))
				cols.push(h(Col, {xs: 18, sm: 12, lg: 10}, () => col2))

				return h('div', {class: 'py4'},
					h(Row, {type: 'flex', align: 'middle', justify: 'center', gutter: 16}, () => cols))
			}))
		}
	}
})
