import { NavLink } from "react-router-dom";

const AdminNav = () => (
  <nav className="distributor-nav">
    <NavLink to="/admin" end>
      概览
    </NavLink>
    <NavLink to="/admin/inventory">分销商库存管理</NavLink>
  </nav>
);

export default AdminNav;
