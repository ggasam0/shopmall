import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import DistributorNav from "../components/DistributorNav";

const DistributorDashboard = () => {
  const [summary, setSummary] = useState(null);
  const dailySeries = summary?.daily_completed_order_series ?? [];
  const monthlySeries = summary?.monthly_completed_order_series ?? [];
  const buildBars = (series) => {
    if (!series.length) {
      return { max: 1, bars: [] };
    }
    const max = Math.max(...series.map((item) => item.count), 1);
    return { max, bars: series };
  };
  const dailyBars = buildBars(dailySeries);
  const monthlyBars = buildBars(monthlySeries);

  useEffect(() => {
    const stored = localStorage.getItem("adminAuth");
    if (!stored) {
      return;
    }
    const auth = JSON.parse(stored);
    if (!auth?.user_id) {
      return;
    }
    let mounted = true;
    const loadSummary = async () => {
      try {
        const data = await apiRequest(`/distributor/${auth.user_id}/summary`);
        if (mounted) {
          setSummary(data);
        }
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

  return (
    <main className="page dashboard">
      <section className="dashboard-hero distributor">
        <div>
          <h2>{summary ? `${summary.name}管理后台` : "分销商管理后台"}</h2>
          <p>掌握佣金、订单与客户运营数据</p>
          {summary?.pickup_address ? (
            <p className="subtle">提货地址：{summary.pickup_address}</p>
          ) : null}
        </div>
        <button type="button">提现申请</button>
      </section>

      <section className="dashboard-summary">
        <div>
          <span>本月佣金</span>
          <strong>{summary ? `¥${summary.commission.toFixed(2)}` : "--"}</strong>
        </div>
        <div>
          <span>累计订单</span>
          <strong>{summary ? summary.total_orders : "--"}</strong>
        </div>
        <div>
          <span>今日已完成订单</span>
          <strong>{summary ? summary.daily_completed_orders : "--"}</strong>
        </div>
        <div>
          <span>本月已完成订单</span>
          <strong>{summary ? summary.monthly_completed_orders : "--"}</strong>
        </div>
        <div>
          <span>客户复购率</span>
          <strong>48%</strong>
        </div>
      </section>

      <DistributorNav />

      <section className="dashboard-panel">
        <header>
          <h3>分销数据</h3>
          <span>已完成订单</span>
        </header>
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
            {!dailySeries.length ? (
              <div className="empty-chart">暂无数据</div>
            ) : null}
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
                    height: `${Math.round(
                      (item.count / monthlyBars.max) * 100
                    )}%`,
                  }}
                  title={`${item.label} ${item.count}单`}
                />
                <span>{item.label}</span>
              </div>
            ))}
            {!monthlySeries.length ? (
              <div className="empty-chart">暂无数据</div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
};

export default DistributorDashboard;
