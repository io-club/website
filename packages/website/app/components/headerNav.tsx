import { Link, useMatches } from '@remix-run/react'


const HeaderNav = () => {
	const matches = useMatches()
	return (
		<div
			className="top-0 sticky justify-between flex bg-white items-center py-3 px-2"
			w-p="12px 10px"
			w-bg="white"
			w-w="100vw"
			w-h="50px"
			w-flex="row"
			w-top="0"
			w-items="center"
		>
			<div className="flex">
				{matches
					.filter((match) => match.handle && match.handle.breadcrumb)
					.map((match, index) => {
						return (
							<ul className="flex" key={match.id}>
								<li>{match.handle?.breadcrumb(match)}{match.data ? ('/'+match.data.article.frontmatter.title):''}</li>
								{index >= matches.length ? (
									' '
								) : (
									<li
										className="text-gray-400 justify-center"
										w-flex="row"
									>
                    /
									</li>
								)}
							</ul>
						)
					})}
			</div>
			<ul className="flex">
				<li w-pl="10px">
					<button className="btn btn-ghost">
						<div className="i-carbon-search text-2xl text-gray-400 inline-block" />
            Search
					</button>
				</li>
				<li w-pl="10px">
					<Link to="/login">
						<button className="btn btn-ghost">
							<div className="i-ant-design-user-outlined text-2xl text-gray-400 inline-block" />
              LogIn
						</button>
					</Link>
				</li>
			</ul>
		</div>
	)
}

export default HeaderNav
