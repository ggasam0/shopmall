import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useProducts from "../hooks/useProducts";
import { resolveImageUrl } from "../utils/products";
import { getStockForDistributor } from "../utils/distributor";
import { useDistributor } from "../store/distributor";

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
  const { products, loading } = useProducts();
  const distributor = useDistributor();
  const [keyword, setKeyword] = useState("");

  const filteredProducts = useMemo(() => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      return products;
    }
    return products.filter(
      (product) =>
        product.name.includes(trimmed) || product.tags?.includes(trimmed)
    );
  }, [products, keyword]);

  return (
    <main className="page home">
      <section className="hero">
        <div className="search">
          <span>🔍</span>
          <input
            placeholder="商品名称 / 条码"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
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

      <section className="notice distributor-card">
        <span>分销商</span>
        <p>
          当前分销商：{distributor.name}，提货地址：
          {distributor.pickupAddress}
        </p>
      </section>

      <section className="categories">
        {categories.map((item) => (
          <Link
            key={item}
            className="category-item"
            to={`/category/${encodeURIComponent(item)}`}
          >
            <div className="icon">商</div>
            <span>{item}</span>
          </Link>
        ))}
      </section>

      <section className="hot-list">
        <header>
          <h3>热销排行榜</h3>
          <span>查看全部</span>
        </header>
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const stock = getStockForDistributor(product.id, distributor.code);
            return (
              <article key={product.id} className="product-card">
                <img src={resolveImageUrl(product.image_url)} alt={product.name} />
                <div>
                  <h4>{product.name}</h4>
                  <p>¥{product.price.toFixed(2)}</p>
                  <p className="stock">库存 {stock}</p>
                  <Link className="action-link" to={`/product/${product.id}`}>
                    选择数量
                  </Link>
                </div>
              </article>
            );
          })}
          {!loading && filteredProducts.length === 0 ? (
            <p className="empty-state">暂无商品</p>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export default Home;
