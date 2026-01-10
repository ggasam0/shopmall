import { NavLink } from "react-router-dom";

const TopNav = () => {
  return (
    <header className="top-nav">
      <div className="brand">
        <span className="brand-dot" />
        <div>
          <h1>烟花商城</h1>
          <p>节庆焰火 · 分销管理一体化</p>
        </div>
      </div>
      <nav>
        <NavLink to="/" end>
          首页
        </NavLink>
        <NavLink to="/profile">我的</NavLink>
        <NavLink to="/admin">管理员</NavLink>
        <NavLink to="/distributor">分销商</NavLink>
      </nav>
    </header>
  );
};

export default TopNav;
