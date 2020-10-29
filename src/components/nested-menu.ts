import {Menu} from 'ant-design-vue';
import {defineComponent, h, inject, PropType, ref, VNode} from 'vue';
import {RouterLink} from 'vue-router';

export declare interface Item {
	label?: string;
	link?: string;
	href?: string;
	type?: 'group' | 'sub';
	callback?: (key: string | number) => void;
	children?: Record<string, Item>;
}

export default defineComponent({
	name: 'NestedMenu',
	props: {
		items: {
			type: Object as PropType<Record<string, Item>>,
			required: true,
		},
		mode: {
			type: String as PropType<'horizontal' | 'vertical' | 'vertical-left' | 'vertical-right' | 'inline'>,
			default: 'horizontal',
		},
		i18n: {
			type: Boolean,
			default: true,
		},
	},
	setup: (props) => {
		let t: (a: string) => string;
		if (props.i18n) {
			const {$ts} = inject('i18n') || {};
			t = $ts;
		} else {
			t = (e) => e;
		}
		const selectedKeys = ref([] as string[]);

		const generateMenu = (k: string, i: Item): VNode => {
			switch (i.type) {
				case 'sub':
					return h(Menu.SubMenu,
						{
							key: k,
						},
						{
							title: () => [
								i.href ?
									h('a', {href: i.href || '#', class: 'inline-block w100'}, t(i.label || k)) :
									h(RouterLink, {to: i.link || '#', class: 'inline-block w100'}, () => t(i.label || k)),
							],
							default: () =>
								Object.entries(i.children || {}).map(([k, v]) => generateMenu(k, v)),
						})
				case 'group':
					return h(
						Menu.ItemGroup,
						{
							title: t(i.label || k),
						},
						() => Object.entries(i.children || {}).map(([k, v]) => generateMenu(k, v))
					);
				default:
					return h(
						Menu.Item,
						{
							key: k,
						},
						() => [
							i.href ?
								h('a', {href: i.href || '#'}, t(i.label || k)) :
								h(RouterLink, {to: i.link || '#'}, () => t(i.label || k)),
						]
					);
			}
		};

		return () => {
			return h(Menu, {
				onClick: ({key, keyPath}) => {
					let k
					let cur = props.items
					while ((k = keyPath.pop())) {
						const item = cur[k]
						if (keyPath.length == 0) {
							if (item.callback) {
								item.callback(key)
							}
						}
						cur = item.children || {}
					}
				},
				mode: props.mode,
				selectedKeys: selectedKeys.value,
				'onUpdate:selectedKeys': (v: string[]) => selectedKeys.value = v,
			}, () => Object.entries(props.items).map(([k, v]) => generateMenu(k, v)))
		};
	},
})
