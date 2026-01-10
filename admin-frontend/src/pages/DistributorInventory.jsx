import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import DistributorNav from "../components/DistributorNav";

const DistributorInventory = () => {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({});
  const [inventoryMessage, setInventoryMessage] = useState("");
  const [inventoryError, setInventoryError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("adminAuth");
    if (!stored) {
      return undefined;
    }
    const auth = JSON.parse(stored);
    if (!auth?.user_id) {
      return undefined;
    }
    let mounted = true;
    const loadInventory = async () => {
      try {
        const [summaryData, productList] = await Promise.all([
          apiRequest(`/distributor/${auth.user_id}/summary`),
          apiRequest("/products")
        ]);
        if (mounted) {
          setSummary(summaryData);
          setProducts(productList);
          const codeKey = summaryData?.code
            ? `distributorInventory:${summaryData.code}`
            : null;
          const legacyKey = `distributorInventory:${auth.user_id}`;
          const saved = (codeKey && localStorage.getItem(codeKey)) || localStorage.getItem(legacyKey);
          setInventory(saved ? JSON.parse(saved) : {});
        }
      } catch (error) {
        if (mounted) {
          setSummary(null);
          setProducts([]);
        }
      }
    };
    loadInventory();
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
    const legacyKey = `distributorInventory:${summary.distributor_id}`;
    const codeKey = summary.code ? `distributorInventory:${summary.code}` : null;
    localStorage.setItem(legacyKey, JSON.stringify(inventory));
    if (codeKey) {
      localStorage.setItem(codeKey, JSON.stringify(inventory));
    }
    setInventoryMessage("库存已保存到本地");
    setInventoryError("");
  };

  return (
    <main className="page dashboard">
      <section className="page-header">
        <div>
          <h2>库存维护</h2>
          <p className="muted">维护分销商自有库存数据</p>
        </div>
      </section>

      <DistributorNav />

      <section className="dashboard-panel">
        <header>
          <h3>库存列表</h3>
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

export default DistributorInventory;
