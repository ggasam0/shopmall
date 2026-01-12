import { Link, useParams, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import useProducts from "../hooks/useProducts";
import { resolveImageUrl } from "../utils/products";
import { getStockForDistributor } from "../utils/distributor";
import { useDistributor } from "../store/distributor";
import { useSupplier } from "../store/supplier";
import { buildSupplierPath } from "../utils/supplier";
import { useCart } from "../store/cart";

const CategoryList = () => {
  const { categoryName } = useParams();
  const { products, loading } = useProducts();
  const distributor = useDistributor();
  const supplier = useSupplier();
  const { items, addItem, updateQuantity } = useCart();
  const supplierPath = (path) => buildSupplierPath(supplier, path);
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");

  const displayCategory = decodeURIComponent(categoryName || "全部类别");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        displayCategory === "全部类别" || product.category === displayCategory;
      const matchesKeyword = keyword
        ? product.name.includes(keyword.trim()) ||
          product.tags?.includes(keyword.trim())
        : true;
      return matchesCategory && matchesKeyword;
    });
  }, [products, displayCategory, keyword]);
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
    <main className="page category">
      <header className="page-header">
        <div>
          <p className="muted">当前类别</p>
          <h2>{displayCategory}</h2>
        </div>
        <Link className="ghost-link" to={supplierPath("/")}>
          返回首页
        </Link>
      </header>

      <div className="search solid">
        <span>🔍</span>
        <input
          placeholder="搜索该类别商品"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      <section className="product-grid">
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
          <p className="empty-state">暂无匹配商品</p>
        ) : null}
      </section>
    </main>
  );
};

export default CategoryList;
