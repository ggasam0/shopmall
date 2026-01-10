import DistributorNav from "../components/DistributorNav";

const DistributorCustomers = () => (
  <main className="page dashboard">
    <section className="page-header">
      <div>
        <h2>客户管理</h2>
        <p className="muted">追踪客户下单节奏与维护计划</p>
      </div>
    </section>

    <DistributorNav />

    <section className="dashboard-panel">
      <header>
        <h3>重点客户</h3>
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

export default DistributorCustomers;
