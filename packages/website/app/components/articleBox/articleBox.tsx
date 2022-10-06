import { Link } from "@remix-run/react";
import { LinksFunction } from "@remix-run/server-runtime";
import { AiFillCalendar, AiFillDatabase, AiFillHeart } from "react-icons/ai";

import AvatarUrl from "../../temporary/avatar.jpg";
import  '~/styles/articleBox.css'
// const Container = styled.div`
//   width: 100%;
//   height: 30vh;
//   display: grid;
//   grid-template-rows: 20% 80%;
//   .top {
//     h1 {
//     display: inline-block;
//       font-size: 50px;
//       a{
//         font-size: 50px;
//         &:hover{
//             background-color: transparent;
//         }
//       }
//       &::after{
//         display: block;
//         content: "";
//         width: 0%;
//         height: 3px;
//         background-color: var(--gray);
//         transition: all 0.3s;
//       }
//       &:hover::after{
//         width: 100%;
//       }
//     }
//   }
//   .bottom {
//     display: grid;
//     grid-template-columns: 30% 70%;
//     .left {
//         ul{
//             li{
//                 padding-bottom: 6px;
//                 img{
//                     border-radius: 50%;
//                     width: 80px;
//                 }
//             }
//         }
//     }S
//     .right {

//     }
//   }
// `;
// export const links: LinksFunction = () => {
// 	return [{ rel: 'stylesheet', href: stylesUrl }]
// }
export const ArticleBox = ({ title }: { title: string }) => {
  return (
    <div className="article-container grid-rows-[20%,80%]" w:w="full" w:h="30vh" w:grid="~">
      <div className="top">
        <h1 w:display="inline-block after:display-block " w:text="50px" >
          {`>`}
          <Link w:text="50px" to={""}>
            {title}
          </Link>
        </h1>
      </div>
      <div className="bottom grid-cols-[30%,70%]" w:grid="~">
        <div className="left">
          <ul>
            <li className="avatar">
              <img w:border="rounded-full" w:w="80px" src={AvatarUrl} alt="avatar" />
            </li>
            <li className="createTime">
              <AiFillCalendar />
              Create:2022-10-2
            </li>
            <li className="type">
              <AiFillDatabase />
              Type:Steins;Gate
            </li>
            <li className="visit">
              <AiFillHeart />
              Visitors:100
            </li>
          </ul>
        </div>
        <div className="right">
          <p w:text="gray-900">
            18岁。维克多·孔多利亚（ヴィクトル·コンドリア）大学脑部科学研究所的研究员。
            仅18岁就跳级大学毕业。更在美国的著名学术期刊（Science）发表论文的货真价实的天才。一见到未知事物，就提起兴趣埋头钻研。属于不太直率的类型，不善于称赞对方。尽管如此，对于自己认可的人，虽然会嘴硬，但还是会抱着尊敬的态度。
            冈部称她为“助手“、“克莉丝汀娜（Christina）”。而本人并不接受。
            也是所谓的傲娇。<Link to={`/`}>Read More</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
