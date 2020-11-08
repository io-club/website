import {Menu} from 'ant-design-vue';
import {defineComponent, h, inject, PropType, VNode} from 'vue';
import {RouterLink} from 'vue-router';

export declare interface Item {
	label: string;
	link?: string;
	href?: string;
	disabled?: boolean;
	type?: 'group' | 'sub' | 'main';
	callback?: (key: string) => void;
	children?: Item[];
}

export default defineComponent({
	name: 'NestedMenu',
	props: {
		items: {
			type: Array as PropType<Item[]>,
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

		return () => {
			const generateMenu = (i: Item): VNode => {
				const label = i.link ?
					h(RouterLink, {to: i.link}, () => t(i.label)) :
					h('a', {href: i.href}, t(i.label))
				switch (i.type) {
					case 'sub':
						return h(Menu.SubMenu,
							{key: i.label},
							{
								title: () => [label],
								default: () => i.children?.map(v => generateMenu(v))
							})
					case 'group':
						return h(
							Menu.ItemGroup,
							{},
							{
								title: () => [label],
								default: () => i.children?.map(v => generateMenu(v))
							},
						);
					case 'main':
						return h(Menu, {
							onClick: ({item, key}) => {
								const i = item.$attrs._item
								if (i.callback) {
									i.callback(key)
								}
							},
							mode: props.mode,
						}, () => i.children?.map(v => generateMenu(v)))
					default:
						return h(
							Menu.Item,
							{
								_item: i,
								key: i.label,
								disabled: i.disabled,
							},
							() => [label]);
				}
			};

			return generateMenu({
				label: 'top',
				type: 'main',
				children: props.items,
			})
		}
	},
})
