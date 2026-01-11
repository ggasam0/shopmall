import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import AdminNav from "../components/AdminNav";

const statusDefinitions = [
  { key: "pendingPickup", label: "待提货", status: "待提货" },
  { key: "completed", label: "已完成", status: "已完成" }
];

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    completedAmount: 0,
    dailyCompletedOrders: 0,
    monthlyCompletedOrders: 0
  });
  const [supplierOrderStats, setSupplierOrderStats] = useState([]);
  const [dailySeries, setDailySeries] = useState([]);
  const [monthlySeries, setMonthlySeries] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadSummary = async () => {
      try {
        const [summaryData, orders, suppliers] = await Promise.all([
          apiRequest("/admin/summary"),
          apiRequest("/orders"),
          apiRequest("/suppliers")
        ]);
        if (!mounted) {
          return;
        }
        setSummary(summaryData);
        const completedOrders = orders.filter((order) => order.status === "已完成");
        const completedAmount = completedOrders.reduce((sum, order) => sum + order.total, 0);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dailyCompletedOrders = completedOrders.filter((order) => {
          const createdAt = new Date(order.created_at);
          return (
            createdAt.getFullYear() === today.getFullYear() &&
            createdAt.getMonth() === today.getMonth() &&
            createdAt.getDate() === today.getDate()
          );
        }).length;
        const monthlyCompletedOrders = completedOrders.filter((order) => {
          const createdAt = new Date(order.created_at);
          return (
            createdAt.getFullYear() === now.getFullYear() &&
            createdAt.getMonth() === now.getMonth()
          );
        }).length;
        setOrderStats({
          totalOrders: orders.length,
          completedOrders: completedOrders.length,
          completedAmount,
          dailyCompletedOrders,
          monthlyCompletedOrders
        });

        const supplierStats = suppliers.map((supplier) => {
          const supplierOrders = orders.filter(
            (order) => order.distributor_code === supplier.distributor.code
          );
          const statusCounts = statusDefinitions.reduce((acc, status) => {
            acc[status.key] = supplierOrders.filter(
              (order) => order.status === status.status
            ).length;
            return acc;
          }, {});
          return {
            supplier,
            statusCounts
          };
        });
        const overallStatusCounts = statusDefinitions.reduce((acc, status) => {
          acc[status.key] = orders.filter((order) => order.status === status.status).length;
          return acc;
        }, {});
        setSupplierOrderStats([
          {
            supplier: { mall_name: "全部供应商", distributor: { name: "整体" } },
            statusCounts: overallStatusCounts
          },
          ...supplierStats
        ]);

        const buildDailySeries = () => {
          const series = [];
          for (let offset = 6; offset >= 0; offset -= 1) {
            const day = new Date(today);
            day.setDate(today.getDate() - offset);
            const label = `${String(day.getMonth() + 1).padStart(2, "0")}-${String(
              day.getDate()
            ).padStart(2, "0")}`;
            const count = completedOrders.filter((order) => {
              const createdAt = new Date(order.created_at);
              return (
                createdAt.getFullYear() === day.getFullYear() &&
                createdAt.getMonth() === day.getMonth() &&
                createdAt.getDate() === day.getDate()
              );
            }).length;
            series.push({ label, count });
          }
          return series;
        };

        const buildMonthlySeries = () => {
          const series = [];
          for (let offset = 6; offset >= 0; offset -= 1) {
            const target = new Date(now.getFullYear(), now.getMonth() - offset, 1);
            const label = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(
              2,
              "0"
            )}`;
            const count = completedOrders.filter((order) => {
              const createdAt = new Date(order.created_at);
              return (
                createdAt.getFullYear() === target.getFullYear() &&
                createdAt.getMonth() === target.getMonth()
              );
            }).length;
            series.push({ label, count });
          }
          return series;
        };
        setDailySeries(buildDailySeries());
        setMonthlySeries(buildMonthlySeries());
      } catch (error) {
        if (mounted) {
          setSummary(null);
          setSupplierOrderStats([]);
          setDailySeries([]);
          setMonthlySeries([]);
        }
      }
    };
    loadSummary();
    return () => {
      mounted = false;
    };
  }, []);

  const buildBars = (series) => {
    if (!series.length) {
      return { max: 1, bars: [] };
    }
    const max = Math.max(...series.map((item) => item.count), 1);
    return { max, bars: series };
  };
  const dailyBars = buildBars(dailySeries);
  const monthlyBars = buildBars(monthlySeries);

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

      <AdminNav />

      <section className="dashboard-panel">
        <header>
          <h3>订单状态</h3>
          <span>按供应商查看</span>
        </header>
        {supplierOrderStats.length ? (
          supplierOrderStats.map((item) => (
            <div key={item.supplier.mall_name} className="status-group">
              <div className="status-group-header">
                <strong>{item.supplier.mall_name}</strong>
                <span className="muted">{item.supplier.distributor.name}</span>
              </div>
              <div className="status-grid">
                {statusDefinitions.map((status) => (
                  <div key={`${item.supplier.mall_name}-${status.key}`}>
                    <strong>{item.statusCounts[status.key] ?? 0}</strong>
                    <span>{status.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state">暂无订单数据。</p>
        )}
      </section>

      <section className="dashboard-panel">
        <header>
          <h3>订单统计</h3>
          <span>整体维度</span>
        </header>
        <div className="dashboard-summary">
          <div>
            <span>累计订单</span>
            <strong>{orderStats.totalOrders}</strong>
          </div>
          <div>
            <span>已完成订单</span>
            <strong>{orderStats.completedOrders}</strong>
          </div>
          <div>
            <span>已完成成交金额</span>
            <strong>¥{orderStats.completedAmount.toFixed(2)}</strong>
          </div>
          <div>
            <span>今日已完成订单</span>
            <strong>{orderStats.dailyCompletedOrders}</strong>
          </div>
          <div>
            <span>本月已完成订单</span>
            <strong>{orderStats.monthlyCompletedOrders}</strong>
          </div>
        </div>
        <div className="chart-block">
          <div className="chart-title">
            <strong>近7天每日已完成订单数</strong>
          </div>
          <div className="sales-chart">
            {dailyBars.bars.map((item) => (
              <div key={item.label} className="bar-group">
                <div
                  className="bar"
                  style={{
                    height: `${Math.round((item.count / dailyBars.max) * 100)}%`,
                  }}
                  title={`${item.label} ${item.count}单`}
                />
                <span>{item.label}</span>
              </div>
            ))}
            {!dailySeries.length ? <div className="empty-chart">暂无数据</div> : null}
          </div>
        </div>
        <div className="chart-block">
          <div className="chart-title">
            <strong>近7月每月已完成订单数量</strong>
          </div>
          <div className="sales-chart monthly">
            {monthlyBars.bars.map((item) => (
              <div key={item.label} className="bar-group">
                <div
                  className="bar"
                  style={{
                    height: `${Math.round((item.count / monthlyBars.max) * 100)}%`,
                  }}
                  title={`${item.label} ${item.count}单`}
                />
                <span>{item.label}</span>
              </div>
            ))}
            {!monthlySeries.length ? <div className="empty-chart">暂无数据</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
