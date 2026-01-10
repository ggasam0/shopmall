import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { resolveImageUrl } from "../utils/products";
import { useDistributor } from "../store/distributor";
import { getStockForDistributor } from "../utils/distributor";
import { useSupplier } from "../store/supplier";
import { buildSupplierPath } from "../utils/supplier";

const Cart = () => {
  const { items, updateQuantity, removeItem, total } = useCart();
  const distributor = useDistributor();
  const supplier = useSupplier();
  const navigate = useNavigate();
  const supplierPath = (path) => buildSupplierPath(supplier, path);

  if (items.length === 0) {
    return (
      <main className="page cart">
        <h2>购物车</h2>
        <p className="empty-state">购物车还是空的，快去选购吧。</p>
        <Link className="primary-button" to={supplierPath("/")}>
          继续选购
        </Link>
      </main>
    );
  }

  return (
    <main className="page cart">
      <header className="page-header">
        <div>
          <p className="muted">我的购物车</p>
          <h2>共 {items.length} 件商品</h2>
        </div>
        <Link className="ghost-link" to={supplierPath("/")}>
          继续选购
        </Link>
      </header>

      <section className="cart-list">
        {items.map((item) => {
          const stock = getStockForDistributor(item.id, distributor.code);
          return (
            <article key={item.id} className="cart-item">
              <img src={resolveImageUrl(item.image_url)} alt={item.name} />
              <div className="cart-info">
                <h4>{item.name}</h4>
                <p className="price">¥{item.price.toFixed(2)}</p>
                <p className="stock">库存 {stock}</p>
                <div className="quantity">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={stock}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.id, Number(event.target.value) || 1)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="cart-actions">
                <p>小计</p>
                <strong>¥{(item.price * item.quantity).toFixed(2)}</strong>
                <button type="button" onClick={() => removeItem(item.id)}>
                  移除
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <footer className="checkout-bar">
        <div>
          <p>合计</p>
          <strong>¥{total.toFixed(2)}</strong>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => navigate(supplierPath("/checkout"))}
        >
          生成订单
        </button>
      </footer>
    </main>
  );
};

export default Cart;
