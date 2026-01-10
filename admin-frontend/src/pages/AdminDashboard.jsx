import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
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
  const [uploadError, setUploadError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedProducts, setUploadedProducts] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");

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

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploadError("");
    setSaveMessage("");
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const mapped = rows.map((row, index) => ({
        id: `${file.name}-${index}`,
        name: row["商品名称"] || row.name || "",
        category: row["类别"] || row.category || "",
        price: Number(row["价格"] || row.price || 0),
        image_url: row["图片"] || row.image_url || "",
        tags: row["标签"] || row.tags || ""
      }));
      const valid = mapped.filter((item) => item.name && item.category);
      if (!valid.length) {
        setUploadError("未识别到商品名称与类别，请检查模板字段。");
        setUploadedProducts([]);
        return;
      }
      setUploadedProducts(valid);
    } catch (error) {
      setUploadError("解析失败，请确认上传的是xlsx文件。");
    }
  };

  const handleSaveProducts = async () => {
    if (!uploadedProducts.length) {
      setUploadError("请先上传包含商品信息的xlsx文件。");
      return;
    }
    setUploadLoading(true);
    setUploadError("");
    setSaveMessage("");
    try {
      await apiRequest("/products/bulk", {
        method: "POST",
        body: JSON.stringify({
          products: uploadedProducts.map(({ name, category, price, image_url, tags }) => ({
            name,
            category,
            price,
            image_url,
            tags
          }))
        })
      });
      setSaveMessage(`已成功保存 ${uploadedProducts.length} 个商品`);
    } catch (error) {
      setUploadError("保存失败，请稍后重试。");
    } finally {
      setUploadLoading(false);
    }
  };

  const previewRows = useMemo(() => uploadedProducts.slice(0, 5), [uploadedProducts]);

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
          <h3>商品Excel导入</h3>
          <span>支持xlsx模板：商品名称 / 类别 / 价格 / 图片 / 标签</span>
        </header>
        <div className="upload-area">
          <input type="file" accept=".xlsx" onChange={handleFileChange} />
          <button type="button" onClick={handleSaveProducts} disabled={uploadLoading}>
            {uploadLoading ? "保存中..." : "保存商品数据"}
          </button>
          {uploadError ? <p className="form-error">{uploadError}</p> : null}
          {saveMessage ? <p className="form-success">{saveMessage}</p> : null}
        </div>
        <div className="upload-preview">
          <div className="preview-header">
            <strong>预览（最多展示5条）</strong>
            <span>共 {uploadedProducts.length} 条</span>
          </div>
          {previewRows.length ? (
            <table>
              <thead>
                <tr>
                  <th>商品名称</th>
                  <th>类别</th>
                  <th>价格</th>
                  <th>图片</th>
                  <th>标签</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.price}</td>
                    <td>{item.image_url || "--"}</td>
                    <td>{item.tags || "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">暂无预览数据，请先上传xlsx。</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
