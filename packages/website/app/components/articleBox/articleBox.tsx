import { Link } from '@remix-run/react'

import AvatarUrl from '../../temporary/avatar.jpg'

export const ArticleBox = ({ title }: { title: string }) => {
	return (
		<div className="article-container wow fadeIn"
			data-wow-duration="1s"
			data-wow-delay="1s"
			data-wow-iteration="1s"
			w-w="full"
			w-h="30vh"
			w-grid="~ rows-[20%80%]">
			<div className="top">
				<h1 className="article-h1" w-display="inline-block after:display-block" w-text="50px" >
					{'>'}
					<Link className="article-header hover:bg-transparent" w-text="50px" to={''} >
						{title}
					</Link>
				</h1>
			</div>
			<div className="bottom" w-grid="~ cols-[30%70%]">
				<div className="left">
					<ul w-list="none">
						<li>
							<img w-border="rounded-full" w-w="80px" src={AvatarUrl} alt="avatar" />
						</li>
						<li className="createTime align-middle " w-display="block" w-h="30px">
							<div className="i-ant-design:calendar-filled" w-display="inline-block" />
							Create:2022-10-2
						</li>
						<li className="type align-middle">
							<div className="i-ant-design:database-filled" w-display="inline-block" />
							Type:Steins;Gate
						</li>
						<li className="visit align-middle">
							<div className="i-ant-design:heart-filled" w-display="inline-block" />
							Visitors:100
						</li>
					</ul>
				</div>
				<div className="right">
					<p w-text="gray-900 20px">
						18岁。维克多·孔多利亚（ヴィクトル·コンドリア）大学脑部科学研究所的研究员。
						仅18岁就跳级大学毕业。更在美国的著名学术期刊（Science）发表论文的货真价实的天才。一见到未知事物，就提起兴趣埋头钻研。属于不太直率的类型，不善于称赞对方。尽管如此，对于自己认可的人，虽然会嘴硬，但还是会抱着尊敬的态度。
						冈部称她为“助手“、“克莉丝汀娜（Christina）”。而本人并不接受。
						也是所谓的傲娇。
						<Link to={'/'}>Read More</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
