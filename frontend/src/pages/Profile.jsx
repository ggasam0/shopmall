import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useSupplier } from "../store/supplier";
import { buildSupplierPath } from "../utils/supplier";

const defaultStatus = [
  { label: "待提货", icon: "🧾" },
  { label: "待发货", icon: "🚚", badge: 0 },
  { label: "待收货", icon: "📦" },
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
    const pendingShipment = orders.filter((order) => order.status === "待发货").length;
    const pendingReceive = orders.filter((order) => order.status === "待收货").length;
    const completed = orders.filter((order) => order.status === "已完成").length;
    return [
      { label: "待提货", icon: "🧾", badge: pendingPickup },
      { label: "待发货", icon: "🚚", badge: pendingShipment },
      { label: "待收货", icon: "📦", badge: pendingReceive },
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

      <section className="stats">
        <div>
          <strong>¥0.00</strong>
          <span>余额·充值</span>
        </div>
        <div>
          <strong>0</strong>
          <span>优惠券</span>
        </div>
        <div>
          <strong>0</strong>
          <span>积分</span>
        </div>
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
                <ul>
                  {(order.items || []).map((item) => (
                    <li key={`${order.id}-${item.id}`}>
                      <span>{item.name}</span>
                      <span>× {item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <div className="order-total">
                  <span>合计</span>
                  <strong>¥{order.total.toFixed(2)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="profile-links">
        <button type="button">
          <span>📱 手机号</span>
          <span>›</span>
        </button>
        <button type="button">
          <span>📍 收货地址管理</span>
          <span>›</span>
        </button>
      </section>
      <footer className="footer-tip">智慧记提供技术支持</footer>
    </main>
  );
};

export default Profile;
