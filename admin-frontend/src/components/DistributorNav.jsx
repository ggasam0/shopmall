import { NavLink } from "react-router-dom";

const DistributorNav = () => (
  <nav className="distributor-nav">
    <NavLink to="/distributor" end>
      概览
    </NavLink>
    <NavLink to="/distributor/orders">订单管理</NavLink>
    <NavLink to="/distributor/customers">客户管理</NavLink>
    <NavLink to="/distributor/inventory">库存维护</NavLink>
  </nav>
);

export default DistributorNav;
