import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

const defaultStatus = [
  { label: "待付款", icon: "💳" },
  { label: "待发货", icon: "🚚", badge: 0 },
  { label: "待收货", icon: "📦" },
  { label: "已完成", icon: "✅" }
];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

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
    const pendingPayment = orders.filter((order) => order.status === "待付款").length;
    const pendingShipment = orders.filter((order) => order.status === "待发货").length;
    const pendingReceive = orders.filter((order) => order.status === "待收货").length;
    const completed = orders.filter((order) => order.status === "已完成").length;
    return [
      { label: "待付款", icon: "💳", badge: pendingPayment },
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
            请先 <Link to="/login">登录</Link>
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
