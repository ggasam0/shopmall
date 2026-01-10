import { useEffect, useState } from "react";
import { apiRequest } from "../api";

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
          <span>客户复购率</span>
          <strong>48%</strong>
        </div>
      </section>

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

      <section className="dashboard-panel">
        <header>
          <h3>客户管理</h3>
          <span>今日新增 6</span>
        </header>
        <div className="customer-list">
          <div>
            <strong>长沙市芙蓉店</strong>
            <span>上次下单：2天前</span>
          </div>
          <div>
            <strong>株洲活动策划</strong>
            <span>上次下单：5天前</span>
          </div>
          <div>
            <strong>岳阳城庆典</strong>
            <span>上次下单：1周前</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DistributorDashboard;
