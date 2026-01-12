import { NavLink } from "react-router-dom";
import { useCart } from "../store/cart";
import { useDistributor } from "../store/distributor";
import { useSupplier } from "../store/supplier";
import { buildSupplierPath } from "../utils/supplier";

const TopNav = () => {
  const { items } = useCart();
  const distributor = useDistributor();
  const supplier = useSupplier();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const supplierPath = (path) => buildSupplierPath(supplier, path);

  return (
    <>
      <header className="top-nav">
        <div className="brand">
          <span className="brand-dot" />
          <div>
            <h1>{supplier.mallName}</h1>
            <p>
              {distributor.name} · {distributor.pickupAddress}
            </p>
          </div>
        </div>
      </header>
      <nav className="bottom-nav">
        <NavLink to={supplierPath("/")} end>
          首页
        </NavLink>
        <NavLink to={supplierPath("/categories")}>分类</NavLink>
        <NavLink to={supplierPath("/cart")}>购物车 ({itemCount})</NavLink>
        <NavLink to={supplierPath("/login")}>登录</NavLink>
        <NavLink to={supplierPath("/profile")}>我的</NavLink>
      </nav>
    </>
  );
};

export default TopNav;
