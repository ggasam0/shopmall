import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const tasks = [
  "审核运营活动物料",
  "处理未发货订单",
  "新增节庆套装SKU",
  "更新门店库存预警"
];

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [orderStats, setOrderStats] = useState({
    pendingPayment: 0,
    pendingShipment: 0,
    pendingReceive: 0,
    completed: 0
  });

  useEffect(() => {
    let mounted = true;
    const loadSummary = async () => {
      try {
        const [summaryData, orders] = await Promise.all([
          apiRequest("/admin/summary"),
          apiRequest("/orders")
        ]);
        if (!mounted) {
          return;
        }
        setSummary(summaryData);
        const pendingPayment = orders.filter((order) => order.status === "待付款").length;
        const pendingShipment = orders.filter((order) => order.status === "待发货").length;
        const pendingReceive = orders.filter((order) => order.status === "待收货").length;
        const completed = orders.filter((order) => order.status === "已完成").length;
        setOrderStats({
          pendingPayment,
          pendingShipment,
          pendingReceive,
          completed
        });
      } catch (error) {
        if (mounted) {
          setSummary(null);
        }
      }
    };
    loadSummary();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    { label: "今日成交额", value: summary ? `¥${summary.total_sales.toFixed(2)}` : "--" },
    { label: "待处理订单", value: summary ? summary.pending_orders : "--" },
    { label: "分销商数量", value: summary ? summary.active_distributors : "--" },
    { label: "主推商品", value: summary ? summary.featured_products : "--" }
  ];

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
            <strong>{orderStats.pendingPayment}</strong>
            <span>待付款</span>
          </div>
          <div>
            <strong>{orderStats.pendingShipment}</strong>
            <span>待发货</span>
          </div>
          <div>
            <strong>{orderStats.pendingReceive}</strong>
            <span>待收货</span>
          </div>
          <div>
            <strong>{orderStats.completed}</strong>
            <span>已完成</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
