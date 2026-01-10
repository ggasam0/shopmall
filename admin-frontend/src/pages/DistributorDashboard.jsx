import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import DistributorNav from "../components/DistributorNav";

const DistributorDashboard = () => {
  const [summary, setSummary] = useState(null);

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
          <span>近7天</span>
        </header>
        <div className="sales-chart">
          <div className="bar" style={{ height: "40%" }} />
          <div className="bar" style={{ height: "65%" }} />
          <div className="bar" style={{ height: "50%" }} />
          <div className="bar" style={{ height: "80%" }} />
          <div className="bar" style={{ height: "72%" }} />
          <div className="bar" style={{ height: "55%" }} />
          <div className="bar" style={{ height: "62%" }} />
        </div>
        <div className="chart-legend">
          <span>主推套装: 60%</span>
          <span>家庭聚会: 25%</span>
          <span>婚庆礼花: 15%</span>
        </div>
      </section>
    </main>
  );
};

export default DistributorDashboard;
