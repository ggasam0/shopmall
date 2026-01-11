import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import AdminNav from "../components/AdminNav";

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributorId, setSelectedDistributorId] = useState("");
  const [selectedDistributorCode, setSelectedDistributorCode] = useState("");
  const [inventory, setInventory] = useState({});
  const [inventoryMessage, setInventoryMessage] = useState("");
  const [inventoryError, setInventoryError] = useState("");

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

  return (
    <main className="page dashboard">
      <section className="page-header">
        <div>
          <h2>分销商库存管理</h2>
          <p className="muted">独立维护分销商库存数据</p>
        </div>
      </section>

      <AdminNav />

      <section className="dashboard-panel">
        <header>
          <h3>库存维护</h3>
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

export default AdminInventory;
