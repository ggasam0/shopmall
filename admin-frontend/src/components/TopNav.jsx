import { NavLink, useNavigate } from "react-router-dom";

const TopNav = () => {
  const navigate = useNavigate();
  const stored = localStorage.getItem("adminAuth");
  const auth = stored ? JSON.parse(stored) : null;

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/login");
  };

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
        {auth ? (
          <button type="button" className="ghost-button" onClick={handleLogout}>
            退出登录
          </button>
        ) : null}
      </nav>
    </header>
  );
};

export default TopNav;
