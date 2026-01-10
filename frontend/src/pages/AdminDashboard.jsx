const stats = [
  { label: "今日成交额", value: "¥12,880" },
  { label: "待处理订单", value: "8" },
  { label: "分销商数量", value: "42" },
  { label: "主推商品", value: "16" }
];

const tasks = [
  "审核运营活动物料",
  "处理未发货订单",
  "新增节庆套装SKU",
  "更新门店库存预警"
];

const AdminDashboard = () => {
  return (
    <main className="page dashboard">
      <section className="dashboard-hero admin">
        <div>
          <h2>管理员工作台</h2>
          <p>实时掌控库存、订单与分销运营</p>
        </div>
        <button type="button">生成日报</button>
      </section>

      <section className="dashboard-stats">
        {stats.map((item) => (
          <div key={item.label} className="stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </section>

      <section className="dashboard-panel">
        <header>
          <h3>今日任务</h3>
          <span>管理后台</span>
        </header>
        <ul>
          {tasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </section>

      <section className="dashboard-panel">
        <header>
          <h3>订单状态</h3>
          <span>快速入口</span>
        </header>
        <div className="status-grid">
          <div>
            <strong>12</strong>
            <span>待提货</span>
          </div>
          <div>
            <strong>6</strong>
            <span>待发货</span>
          </div>
          <div>
            <strong>9</strong>
            <span>待收货</span>
          </div>
          <div>
            <strong>28</strong>
            <span>已完成</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
