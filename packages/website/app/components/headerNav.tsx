import { Link, useMatches } from '@remix-run/react'

const HeaderNav = () => {
	const matches = useMatches()
	return (
		<div w-justify="between" w-item="center" w-flex="~" w-p="y-12 x-10" w-pos="sticky" w-top="0">
			<ul w-flex="~" w-children:p="r-4">
				{matches.slice(0, -1).map(match => <li
					key={match.id}
					data-sep="/ "
					className="not-last:after:content-raw-[attr(data-sep)]"
				>{match.handle?.breadcrumb(match)}</li>
				)}
			</ul>
			<ul w-flex="~" w-children:p="l-10">
				<li>
					<button>
						<div className="i-ant-design:search-outlined" w-display="inline-block" />Search
					</button>
				</li>
				<li>
					<button>
						<Link to="/login" w-decoration="none">
							<div className="i-ant-design:user-outlined" w-display="inline-block" />Login
						</Link>
					</button>
				</li>
			</ul>
		</div>
	)
}

export default HeaderNav
