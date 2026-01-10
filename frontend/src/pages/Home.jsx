import { useEffect, useState } from "react";
import API_BASE, { apiRequest } from "../api";

const categories = [
  "全部类别",
  "其他类别",
  "套餐",
  "手持烟花",
  "地面喷花",
  "纸炮",
  "升空类",
  "夜景烟花",
  "日景烟花",
  "摔炮"
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    return `${API_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      try {
        const data = await apiRequest("/products");
        if (mounted) {
          setProducts(data);
        }
      } catch (error) {
        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="page home">
      <section className="hero">
        <div className="search">
          <span>🔍</span>
          <input placeholder="商品名称 / 条码" />
        </div>
        <div className="banner">
          <div>
            <h2>热销爆品</h2>
            <p>优惠多多</p>
          </div>
          <button type="button">立即选购</button>
        </div>
        <div className="dots">
          <span className="dot active" />
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </section>

      <section className="notice">
        <span>公告</span>
        <p>「有商品满200 都有赠送小礼物 欢迎新老顾客前来订货」</p>
      </section>

      <section className="categories">
        {categories.map((item) => (
          <div key={item} className="category-item">
            <div className="icon">商</div>
            <span>{item}</span>
          </div>
        ))}
      </section>

      <section className="hot-list">
        <header>
          <h3>热销排行榜</h3>
          <span>查看全部</span>
        </header>
        <div className="product-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <img src={resolveImageUrl(product.image_url)} alt={product.name} />
              <div>
                <h4>{product.name}</h4>
                <p>¥{product.price.toFixed(2)}</p>
              </div>
            </article>
          ))}
          {!loading && products.length === 0 ? (
            <p className="empty-state">暂无商品</p>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export default Home;
