import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useSupplier } from "../store/supplier";
import { buildSupplierPath } from "../utils/supplier";

const defaultStatus = [
  { label: "待提货", icon: "🧾" },
  { label: "已完成", icon: "✅" }
];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const supplier = useSupplier();
  const supplierPath = (path) => buildSupplierPath(supplier, path);

  useEffect(() => {
    const stored = localStorage.getItem("shopmallUser");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    let mounted = true;
    const loadOrders = async () => {
      try {
        const data = await apiRequest(`/users/${user.id}/orders`);
        if (mounted) {
          setOrders(data);
        }
      } catch (error) {
        if (mounted) {
          setOrders([]);
        }
      }
    };
    loadOrders();
    return () => {
      mounted = false;
    };
  }, [user]);

  const orderStatus = useMemo(() => {
    const pendingPickup = orders.filter((order) => order.status === "待提货").length;
    const completed = orders.filter((order) => order.status === "已完成").length;
    return [
      { label: "待提货", icon: "🧾", badge: pendingPickup },
      { label: "已完成", icon: "✅", badge: completed }
    ];
  }, [orders]);

  return (
    <main className="page profile">
      <section className="profile-card">
        <h2>{user?.phone || "未登录"}</h2>
        {!user ? (
          <p>
            请先 <Link to={supplierPath("/login")}>登录</Link>
          </p>
        ) : null}
      </section>

      <section className="orders">
        <header>
          <h3>我的订单</h3>
          <span>查看更多</span>
        </header>
        <div className="order-status">
          {(user ? orderStatus : defaultStatus).map((status) => (
            <div key={status.label} className="status-item">
              <div className="status-icon">
                {status.icon}
                {status.badge ? (
                  <span className="badge">{status.badge}</span>
                ) : null}
              </div>
              <span>{status.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="order-history">
        <header>
          <h3>历史订单</h3>
          <span>到店付款提货</span>
        </header>
        {!user ? (
          <p className="empty-state">登录后查看订单记录。</p>
        ) : orders.length === 0 ? (
          <p className="empty-state">暂无历史订单。</p>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div className="order-meta">
                  <div>
                    <h4>订单号：{order.order_number}</h4>
                    <p className="muted">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="status-tag">{order.status}</span>
                </div>
                <ul className="order-items-table">
                  <li className="order-items-row order-items-header">
                    <span>商品</span>
                    <span>数量</span>
                    <span>单价</span>
                    <span>小计</span>
                  </li>
                  {(order.items || []).map((item) => (
                    <li key={`${order.id}-${item.id}`} className="order-items-row">
                      <span>{item.name}</span>
                      <span>{item.quantity}</span>
                      <span>¥{item.price.toFixed(2)}</span>
                      <span>¥{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="order-total">
                  <span>总计</span>
                  <strong>¥{order.total.toFixed(2)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <footer className="footer-tip">智慧记提供技术支持</footer>
    </main>
  );
};

export default Profile;
