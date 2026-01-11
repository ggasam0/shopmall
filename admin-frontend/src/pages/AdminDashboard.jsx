import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import AdminNav from "../components/AdminNav";

const statusDefinitions = [
  { key: "pendingPickup", label: "待提货", status: "待提货" },
  { key: "completed", label: "已完成", status: "已完成" }
];

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierCode, setSelectedSupplierCode] = useState("all");
  const [periodMode, setPeriodMode] = useState("day");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
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
        setOrders(orders);
        setSuppliers(suppliers);
        const completedOrders = orders.filter((order) => order.status === "已完成");
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
          const completedAmount = supplierOrders
            .filter((order) => order.status === "已完成")
            .reduce((sum, order) => sum + order.total, 0);
          return {
            supplier,
            statusCounts,
            completedAmount
          };
        });
        const overallStatusCounts = statusDefinitions.reduce((acc, status) => {
          acc[status.key] = orders.filter((order) => order.status === status.status).length;
          return acc;
        }, {});
        const overallCompletedAmount = orders
          .filter((order) => order.status === "已完成")
          .reduce((sum, order) => sum + order.total, 0);
        setSupplierOrderStats([
          {
            supplier: { mall_name: "全部供应商", distributor: { name: "整体" } },
            statusCounts: overallStatusCounts,
            completedAmount: overallCompletedAmount
          },
          ...supplierStats
        ]);

        const getFilteredOrders = (supplierCode) =>
          supplierCode === "all"
            ? orders
            : orders.filter((order) => order.distributor_code === supplierCode);

        const buildDailySeries = () => {
          const filteredCompleted = getFilteredOrders(selectedSupplierCode).filter(
            (order) => order.status === "已完成"
          );
          const series = [];
          for (let offset = 6; offset >= 0; offset -= 1) {
            const day = new Date(today);
            day.setDate(today.getDate() - offset);
            const label = `${String(day.getMonth() + 1).padStart(2, "0")}-${String(
              day.getDate()
            ).padStart(2, "0")}`;
            const count = filteredCompleted.filter((order) => {
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
          const filteredCompleted = getFilteredOrders(selectedSupplierCode).filter(
            (order) => order.status === "已完成"
          );
          const series = [];
          for (let offset = 6; offset >= 0; offset -= 1) {
            const target = new Date(now.getFullYear(), now.getMonth() - offset, 1);
            const label = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(
              2,
              "0"
            )}`;
            const count = filteredCompleted.filter((order) => {
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
  }, [selectedSupplierCode]);

  const filteredOrders =
    selectedSupplierCode === "all"
      ? orders
      : orders.filter((order) => order.distributor_code === selectedSupplierCode);
  const filteredCompletedOrders = filteredOrders.filter((order) => order.status === "已完成");
  const selectedDateValue = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;
  const [selectedYear, selectedMonthValue] = selectedMonth
    ? selectedMonth.split("-").map((value) => Number(value))
    : [];
  const periodCompletedOrders =
    periodMode === "day" && selectedDateValue
      ? filteredCompletedOrders.filter((order) => {
          const createdAt = new Date(order.created_at);
          return (
            createdAt.getFullYear() === selectedDateValue.getFullYear() &&
            createdAt.getMonth() === selectedDateValue.getMonth() &&
            createdAt.getDate() === selectedDateValue.getDate()
          );
        })
      : filteredCompletedOrders.filter((order) => {
          const createdAt = new Date(order.created_at);
          return (
            createdAt.getFullYear() === selectedYear &&
            createdAt.getMonth() + 1 === selectedMonthValue
          );
        });
  const periodCompletedCount = periodCompletedOrders.length;
  const periodCompletedAmount = periodCompletedOrders.reduce((sum, order) => sum + order.total, 0);

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
                <div>
                  <strong>¥{(item.completedAmount ?? 0).toFixed(2)}</strong>
                  <span>已完成金额</span>
                </div>
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
          <span>筛选维度</span>
        </header>
        <div className="dashboard-summary">
          <div>
            <span>供应商</span>
            <select
              value={selectedSupplierCode}
              onChange={(event) => setSelectedSupplierCode(event.target.value)}
            >
              <option value="all">全部供应商</option>
              {suppliers.map((supplier) => (
                <option key={supplier.distributor.code} value={supplier.distributor.code}>
                  {supplier.mall_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span>统计周期</span>
            <div className="inline-controls">
              <label>
                <input
                  type="radio"
                  name="period-mode"
                  value="day"
                  checked={periodMode === "day"}
                  onChange={() => setPeriodMode("day")}
                />
                按日
              </label>
              <label>
                <input
                  type="radio"
                  name="period-mode"
                  value="month"
                  checked={periodMode === "month"}
                  onChange={() => setPeriodMode("month")}
                />
                按月
              </label>
            </div>
          </div>
          <div>
            <span>{periodMode === "day" ? "指定日期" : "指定月份"}</span>
            {periodMode === "day" ? (
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            ) : (
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              />
            )}
          </div>
        </div>
        <div className="dashboard-summary">
          <div>
            <span>已完成订单</span>
            <strong>{periodCompletedCount}</strong>
          </div>
          <div>
            <span>已完成金额</span>
            <strong>¥{periodCompletedAmount.toFixed(2)}</strong>
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
