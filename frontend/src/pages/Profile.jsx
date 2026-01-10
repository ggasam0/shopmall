const orderStatus = [
  { label: "待付款", icon: "💳" },
  { label: "待发货", icon: "🚚", badge: 1 },
  { label: "待收货", icon: "📦" },
  { label: "已完成", icon: "✅" }
];

const Profile = () => {
  return (
    <main className="page profile">
      <section className="profile-card">
        <h2>13763316649</h2>
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
          {orderStatus.map((status) => (
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
