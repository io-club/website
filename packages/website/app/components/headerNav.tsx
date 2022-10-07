import { Link, useMatches } from "@remix-run/react";

import uuid from "react-uuid";

import {AiOutlineSearch,AiOutlineUser} from 'react-icons/ai';


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
          <Link to="/login"><button className="button"><AiOutlineUser/>LogIn</button></Link>
          
        </li>
      </div>
    </div>
  );
};

export default HeaderNav;
