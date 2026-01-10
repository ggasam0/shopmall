import { NavLink } from "react-router-dom";

const TopNav = () => {
  return (
    <header className="top-nav">
      <div className="brand">
        <span className="brand-dot" />
        <div>
          <h1>烟花商城</h1>
          <p>分销商/管理员后台</p>
        </div>
      </div>
      <nav>
        <NavLink to="/admin">管理员</NavLink>
        <NavLink to="/distributor">分销商</NavLink>
      </nav>
    </header>
  );
};

export default TopNav;
