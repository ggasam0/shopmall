import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useProducts from "../hooks/useProducts";
import { getStockForDistributor } from "../utils/distributor";
import { resolveImageUrl } from "../utils/products";
import { useDistributor } from "../store/distributor";
import { useSupplier } from "../store/supplier";
import { buildSupplierPath } from "../utils/supplier";
import { useCart } from "../store/cart";

const CategoryMenu = () => {
  const { products, loading } = useProducts();
  const distributor = useDistributor();
  const supplier = useSupplier();
  const { items, addItem, updateQuantity } = useCart();
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
    return list.length ? list : ["其他类别"];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState(categories[0]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const filteredProducts = useMemo(() => {
    const matchesCategory = (product) =>
      activeCategory === "全部类别" || product.category === activeCategory;
    return products.filter(matchesCategory);
  }, [products, activeCategory]);

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
    <main className="page category-menu">
      <header className="page-header">
        <div>
          <p className="muted">商品分类</p>
          <h2>按类别挑选</h2>
        </div>
        <Link className="ghost-link" to={supplierPath("/")}>
          返回首页
        </Link>
      </header>

      <section className="category-layout">
        <aside className="category-sidebar">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={category === activeCategory ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </aside>
        <div className="category-content">
          <div className="category-content-header">
            <div>
              <p className="muted">当前类别</p>
              <h3>{activeCategory}</h3>
            </div>
            <Link
              className="ghost-link"
              to={supplierPath(`/category/${encodeURIComponent(activeCategory)}`)}
            >
              查看该类别所有商品
            </Link>
          </div>

          <div className="product-grid">
            {availableProducts.map((product) => {
              const stock = getStockForDistributor(product.id, distributor.code);
              const quantity = quantities[product.id] ?? 0;
              return (
                <article key={product.id} className="product-card">
                  <Link
                    className="product-link"
                    to={supplierPath(`/product/${product.id}`)}
                  >
                    <img src={resolveImageUrl(product.image_url)} alt={product.name} />
                    <div>
                      <h4>{product.name}</h4>
                      <p>¥{product.price.toFixed(2)}</p>
                      <p className="stock">库存 {stock}</p>
                    </div>
                  </Link>
                  <div>
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
              <p className="empty-state">当前类别暂无商品</p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
};

export default CategoryMenu;
