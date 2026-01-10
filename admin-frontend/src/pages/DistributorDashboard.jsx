import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const DistributorDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState({});
  const [inventoryMessage, setInventoryMessage] = useState("");
  const [inventoryError, setInventoryError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");

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
        const [data, productList, orderList] = await Promise.all([
          apiRequest(`/distributor/${auth.user_id}/summary`),
          apiRequest("/products"),
          apiRequest(`/users/${auth.user_id}/orders`)
        ]);
        if (mounted) {
          setSummary(data);
          setProducts(productList);
          setOrders(orderList);
          const cacheKey = `distributorInventory:${auth.user_id}`;
          const saved = localStorage.getItem(cacheKey);
          setInventory(saved ? JSON.parse(saved) : {});
        }
      } catch (error) {
        if (mounted) {
          setSummary(null);
          setProducts([]);
          setOrders([]);
        }
      }
    };
    loadSummary();
    return () => {
      mounted = false;
    };
  }, []);

  const handleInventoryChange = (productId, value) => {
    setInventory((prev) => ({
      ...prev,
      [productId]: Number(value)
    }));
    setInventoryMessage("");
    setInventoryError("");
  };

  const handleSaveInventory = () => {
    if (!summary?.distributor_id) {
      setInventoryError("无法获取分销商信息");
      return;
    }
    const cacheKey = `distributorInventory:${summary.distributor_id}`;
    localStorage.setItem(cacheKey, JSON.stringify(inventory));
    setInventoryMessage("库存已保存到本地");
    setInventoryError("");
  };

  const handleCompleteOrder = async (orderId) => {
    setOrderMessage("");
    setOrderError("");
    try {
      const updated = await apiRequest(`/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "已完成" })
      });
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)));
      setOrderMessage("订单状态已更新为已完成");
    } catch (error) {
      setOrderError("更新订单状态失败");
    }
  };

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

      <section className="dashboard-panel">
        <header>
          <h3>订单管理</h3>
          <span>待提货可标记为已完成</span>
        </header>
        {orders.length ? (
          <table className="order-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>状态</th>
                <th>总计</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.status}</td>
                  <td>¥{order.total.toFixed(2)}</td>
                  <td>
                    {order.status === "待提货" ? (
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => handleCompleteOrder(order.id)}
                      >
                        标记已完成
                      </button>
                    ) : (
                      <span className="muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">暂无订单数据。</p>
        )}
        {orderError ? <p className="form-error">{orderError}</p> : null}
        {orderMessage ? <p className="form-success">{orderMessage}</p> : null}
      </section>

      <section className="dashboard-panel">
        <header>
          <h3>我的库存维护</h3>
          <span>仅影响分销商自有库存</span>
        </header>
        <div className="inventory-panel">
          {products.length ? (
            <table>
              <thead>
                <tr>
                  <th>商品名称</th>
                  <th>类别</th>
                  <th>当前库存</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={inventory[product.id] ?? 0}
                        onChange={(event) => handleInventoryChange(product.id, event.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">暂无商品数据，无法维护库存。</p>
          )}
          <div className="inventory-actions">
            <button type="button" onClick={handleSaveInventory}>
              保存库存
            </button>
            {inventoryError ? <p className="form-error">{inventoryError}</p> : null}
            {inventoryMessage ? <p className="form-success">{inventoryMessage}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
};

export default DistributorDashboard;
