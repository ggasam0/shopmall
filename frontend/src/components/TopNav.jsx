import { NavLink } from "react-router-dom";
import { useCart } from "../store/cart";
import { useDistributor } from "../store/distributor";

const TopNav = () => {
  const { items } = useCart();
  const distributor = useDistributor();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="top-nav">
      <div className="brand">
        <span className="brand-dot" />
        <div>
          <h1>烟花商城</h1>
          <p>
            {distributor.name} · {distributor.pickupAddress}
          </p>
        </div>
      </div>
      <nav>
        <NavLink to="/" end>
          首页
        </NavLink>
        <NavLink to="/cart">购物车 ({itemCount})</NavLink>
        <NavLink to="/login">登录</NavLink>
        <NavLink to="/profile">我的</NavLink>
      </nav>
    </header>
  );
};

export default TopNav;
