import {GithubOutlined} from '@ant-design/icons-vue'
import {VueComponent as Web} from '@mdi/svg/svg/web.svg'
import {Button, Carousel, Col, Row} from 'ant-design-vue'
import {defineComponent, inject, onMounted, ref} from 'vue'
import {RouterLink} from 'vue-router'

import Beer from '/@/components/beer.vue'

export default defineComponent({
	setup() {
		const br = inject('breakpoints') || {}
		const {$ts: t} = inject('i18n') || {}
		const carousel = ref(null)
		let next = 0;
		onMounted(() => {
			let start: DOMHighResTimeStamp | undefined;

			function step(timestamp: DOMHighResTimeStamp) {
				if (start === undefined)
					start = timestamp;

				const elapsed = timestamp - start;

				if (elapsed < 3000) {
					requestAnimationFrame(step);
				} else {
					start = undefined;
					carousel.value?.goTo(++next % items.length)
					requestAnimationFrame(step);
				}
			}

			requestAnimationFrame(step);
		})
		return () => {
			const items = [
				{
					img: <Beer />,
					hero: [t('home_sli1_hero'), <span class='animate-blink'>_</span>],
					sub: t('home_sli1_sub'),
					extra: <Button.Group>
						{() => [
							<Button type='primary' disabled>
								{() => t('join_us')}
							</Button>,
							<Button type='primary'>
								{() =>
									<RouterLink to='/posts/about'>
										{() => t('learn_more')}
									</RouterLink>}
							</Button>
						]}
					</Button.Group>
				},
				{
					img: <Web />,
					hero: t('home_sli2_hero'),
					sub: t('home_sli2_sub'),
					extra:
						<Button type='primary'>
							{() =>
								<a href='//github.com/xhebox/ioclub'>
									<GithubOutlined />xhebox/ioclub
							</a>}
						</Button>
				},
			];

			const ret: JSX.Element[] = [];
			for (const v of items) {
				ret.push(<div class="py4">
					<Row type="flex" align="middle" justify="center" gutter={16}>
						{() => [
							<Col xs={8} sm={5} lg={4} xl={3}>
								{() => v.img}
							</Col>,
							<Col xs={20} sm={12} lg={10}>
								{() => [
									<p class={`${!br.sm ? 'text-center' : ''} ${!br.md ? 'f2 f600' : 'f3 f600'}`}>
										{v.hero}
									</p>,
									<p class={`${!br.md ? 'f1' : 'f2'}`}>
										{v.sub}
									</p>,
									<p class={`${!br.sm ? 'text-center' : 'text-end'}`}>
										{v.extra}
									</p>
								]}
							</Col>
						]}
					</Row>
				</div>)
			}
			return <Carousel class="bg-front fc-back" adaptiveHeight infinite={false} ref={carousel}>
				{() => ret}
			</Carousel>
		}
	}
})
