import { Link, useParams, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import useProducts from "../hooks/useProducts";
import { resolveImageUrl } from "../utils/products";
import { getStockForDistributor } from "../utils/distributor";
import { useDistributor } from "../store/distributor";
import { useSupplier } from "../store/supplier";
import { buildSupplierPath } from "../utils/supplier";

const CategoryList = () => {
  const { categoryName } = useParams();
  const { products, loading } = useProducts();
  const distributor = useDistributor();
  const supplier = useSupplier();
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
          return (
            <article key={product.id} className="product-card">
              <img src={resolveImageUrl(product.image_url)} alt={product.name} />
              <div>
                <h4>{product.name}</h4>
                <p>¥{product.price.toFixed(2)}</p>
                <p className="stock">库存 {stock}</p>
                <Link className="action-link" to={supplierPath(`/product/${product.id}`)}>
                  选择数量
                </Link>
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
