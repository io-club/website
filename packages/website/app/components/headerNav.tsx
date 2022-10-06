import { useMatches } from "@remix-run/react";

import uuid from "react-uuid";

import {AiOutlineSearch,AiOutlineUser} from 'react-icons/ai';
import stylesUrl from '~/styles/headernav.css';
import type { LinksFunction } from "@remix-run/node";
export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: stylesUrl }]
}
// const Container = styled.div`
//   background-color: var(--white);
//   width: 100vw;
//   height: 50px;
//   display: flex;
//   padding: 12px 10px;
//   justify-content: space-between;
//   align-items: center;
//   position:sticky;
//   top: 0;
//   .left {
//     display: flex;
//     div {
//       display: flex;
//       .breadcrumb {
//         padding: 0 4px;
//         display: flex;
//         justify-content: center;
//         color: var(--gray);
//       }
//     }
//   }
//   .right{
//     display: flex;
//     li{
//       padding-left: 10px;
//     }
//   }

// `;
const HeaderNav = () => {
  const matches = useMatches();
  return (
    <div className="headernav justify-between flex bg-white items-center py-3 px-2">
      <div className="left flex">
        {matches
          .filter((match) => match.handle && match.handle.breadcrumb)
          .map((match, index) => (
            <div className="flex" key={uuid()}>
              <li>{match.handle?.breadcrumb(match)}</li>
              {index === matches.length - 2 ? (
                " "
              ) : (
                <li className="breadcrumb">/</li>
              )}
            </div>
          ))}
      </div>
      <div className="right flex">
        <li className="search">
          <button className="button"><AiOutlineSearch/>Search</button>   
        </li>
        <li className="login">
          <button className="button"><AiOutlineUser/>LogIn</button>
        </li>
      </div>
    </div>
  );
};

export default HeaderNav;
