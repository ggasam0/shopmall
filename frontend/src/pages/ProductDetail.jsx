import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import useProducts from "../hooks/useProducts";
import { resolveImageUrl } from "../utils/products";
import { getStockForDistributor } from "../utils/distributor";
import { useDistributor } from "../store/distributor";
import { useCart } from "../store/cart";
import { useSupplier } from "../store/supplier";
import { buildSupplierPath } from "../utils/supplier";

const ProductDetail = () => {
  const { productId } = useParams();
  const { products, loading } = useProducts();
  const distributor = useDistributor();
  const supplier = useSupplier();
  const { addItem } = useCart();
  const supplierPath = (path) => buildSupplierPath(supplier, path);

  const product = useMemo(
    () => products.find((item) => String(item.id) === String(productId)),
    [products, productId]
  );

  const stock = product ? getStockForDistributor(product.id, distributor.code) : 0;
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }
    addItem(product, quantity);
  };

  if (loading) {
    return (
      <main className="page">
        <p>加载中...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page">
        <p>未找到该商品。</p>
        <Link className="ghost-link" to={supplierPath("/")}>
          返回首页
        </Link>
      </main>
    );
  }

  return (
    <main className="page product-detail">
      <header className="page-header">
        <div>
          <p className="muted">商品详情</p>
          <h2>{product.name}</h2>
        </div>
        <Link
          className="ghost-link"
          to={supplierPath(`/category/${encodeURIComponent(product.category)}`)}
        >
          查看同类
        </Link>
      </header>

      <section className="detail-card">
        <img src={resolveImageUrl(product.image_url)} alt={product.name} />
        <div className="detail-info">
          <p className="price">¥{product.price.toFixed(2)}</p>
          <p className="tag">{product.category}</p>
          <p className="stock">{distributor.name}库存：{stock}</p>
          {product.tags ? <p className="tags">标签：{product.tags}</p> : null}
          <div className="quantity">
            <span>购买数量</span>
            <div>
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={stock}
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Math.min(
                      Math.max(Number(event.target.value) || 1, 1),
                      stock
                    )
                  )
                }
              />
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.min(prev + 1, stock))}
              >
                +
              </button>
            </div>
          </div>
          <button className="primary-button" type="button" onClick={handleAddToCart}>
            加入购物车
          </button>
          <Link className="ghost-link" to={supplierPath("/cart")}>
            去购物车查看
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;
