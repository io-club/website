import { ArticleBox } from "~/components/articleBox/articleBox"


const titleList = [
  "开始与终结的序章",
  "时间跳跃的偏执狂",
  "平行时空的偏执狂",
  "空理彷徨的会面",
  "电荷冲突的会面",
  "蝶翼的分歧",
  "断层的分歧",
  "梦幻的自平衡",
  "幻象的自平衡",
  "相生的自平衡",
]
const HomeIndex = () => {
  return (
    <div>
      {titleList.map((title,index)=><ArticleBox key={index} title={title}/>)}
    </div>
  )
}

export default HomeIndex