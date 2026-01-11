import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useProducts from "../hooks/useProducts";
import { resolveImageUrl } from "../utils/products";
import { getStockForDistributor } from "../utils/distributor";
import { useDistributor } from "../store/distributor";
import { useSupplier } from "../store/supplier";
import { buildSupplierPath } from "../utils/supplier";
import { useCart } from "../store/cart";

const Home = () => {
  const { products, loading } = useProducts();
  const distributor = useDistributor();
  const supplier = useSupplier();
  const { items, addItem, updateQuantity } = useCart();
  const [keyword, setKeyword] = useState("");
  const supplierPath = (path) => buildSupplierPath(supplier, path);
  const categories = useMemo(() => {
    const seen = new Set();
    const list = ["全部类别"];
    products.forEach((product) => {
      const category = product.category?.trim();
      if (category && !seen.has(category)) {
        seen.add(category);
        list.push(category);
      }
    });
    return list;
  }, [products]);

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
  const availableProducts = useMemo(
    () =>
      filteredProducts.filter(
        (product) => getStockForDistributor(product.id, distributor.code) > 0
      ),
    [filteredProducts, distributor.code]
  );
  const quantities = useMemo(
    () =>
      items.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {}),
    [items]
  );

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
            to={supplierPath(`/category/${encodeURIComponent(item)}`)}
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
          {availableProducts.map((product) => {
            const stock = getStockForDistributor(product.id, distributor.code);
            const quantity = quantities[product.id] ?? 0;
            return (
              <article key={product.id} className="product-card">
                <img src={resolveImageUrl(product.image_url)} alt={product.name} />
                <div>
                  <h4>{product.name}</h4>
                  <p>¥{product.price.toFixed(2)}</p>
                  <p className="stock">库存 {stock}</p>
                  <div className="quantity">
                    <button
                      type="button"
                      disabled={quantity === 0}
                      onClick={() =>
                        updateQuantity(product.id, Math.max(quantity - 1, 0))
                      }
                    >
                      -
                    </button>
                    <input type="number" min="0" max={stock} readOnly value={quantity} />
                    <button
                      type="button"
                      disabled={quantity >= stock}
                      onClick={() => addItem(product, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {!loading && availableProducts.length === 0 ? (
            <p className="empty-state">暂无商品</p>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export default Home;
