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
  const [products, setProducts] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributorId, setSelectedDistributorId] = useState("");
  const [selectedDistributorCode, setSelectedDistributorCode] = useState("");
  const [inventory, setInventory] = useState({});
  const [inventoryMessage, setInventoryMessage] = useState("");
  const [inventoryError, setInventoryError] = useState("");

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

  useEffect(() => {
    let mounted = true;
    const loadBaseData = async () => {
      try {
        const [productList, users] = await Promise.all([
          apiRequest("/products"),
          apiRequest("/users")
        ]);
        if (!mounted) {
          return;
        }
        const distributorList = users.filter((user) => user.role === "distributor");
        setProducts(productList);
        setDistributors(distributorList);
        if (distributorList.length) {
          setSelectedDistributorId(String(distributorList[0].id));
        }
      } catch (error) {
        if (mounted) {
          setProducts([]);
          setDistributors([]);
          setSelectedDistributorId("");
        }
      }
    };
    loadBaseData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDistributorId) {
      setInventory({});
      setSelectedDistributorCode("");
      return;
    }
    let mounted = true;
    const loadInventory = async () => {
      try {
        const summaryData = await apiRequest(
          `/distributor/${selectedDistributorId}/summary`
        );
        if (!mounted) {
          return;
        }
        const distributorCode = summaryData?.code || "";
        setSelectedDistributorCode(distributorCode);
        if (!distributorCode) {
          setInventory({});
          setInventoryError("无法获取分销商编码");
          return;
        }
        const inventoryList = await apiRequest(`/inventory/${distributorCode}`);
        if (!mounted) {
          return;
        }
        const nextInventory = inventoryList.reduce((acc, item) => {
          acc[item.product_id] = item.stock;
          return acc;
        }, {});
        setInventory(nextInventory);
        setInventoryMessage("");
        setInventoryError("");
      } catch (error) {
        if (mounted) {
          setInventory({});
          setInventoryError("库存加载失败，请稍后重试");
        }
      }
    };
    loadInventory();
    return () => {
      mounted = false;
    };
  }, [selectedDistributorId]);

  const handleInventoryChange = (productId, value) => {
    setInventory((prev) => ({
      ...prev,
      [productId]: Number(value)
    }));
    setInventoryMessage("");
    setInventoryError("");
  };

  const handleSaveInventory = () => {
    if (!selectedDistributorId) {
      setInventoryError("请先选择分销商");
      return;
    }
    if (!selectedDistributorCode) {
      setInventoryError("无法获取分销商编码");
      return;
    }
    const items = Object.entries(inventory).map(([productId, stock]) => ({
      product_id: Number(productId),
      stock: Number(stock)
    }));
    apiRequest(`/inventory/${selectedDistributorCode}`, {
      method: "PUT",
      body: JSON.stringify({ items })
    })
      .then(() => {
        setInventoryMessage("库存已保存到数据库");
        setInventoryError("");
      })
      .catch(() => {
        setInventoryError("库存保存失败，请稍后重试");
        setInventoryMessage("");
      });
  };

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

      <section className="dashboard-panel">
        <header>
          <h3>分销商库存管理</h3>
          <span>筛选分销商查看并维护库存</span>
        </header>
        {distributors.length ? (
          <label className="inventory-filter">
            分销商：
            <select
              value={selectedDistributorId}
              onChange={(event) => setSelectedDistributorId(event.target.value)}
            >
              {distributors.map((distributor) => (
                <option key={distributor.id} value={distributor.id}>
                  {distributor.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="empty-state">暂无分销商数据。</p>
        )}
        <div className="inventory-panel">
          {products.length && selectedDistributorId ? (
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
            <p className="empty-state">暂无商品或分销商数据，无法维护库存。</p>
          )}
          <div className="inventory-actions">
            <button type="button" onClick={handleSaveInventory} disabled={!selectedDistributorId}>
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

export default AdminDashboard;
