import { Link } from "react-router-dom";
import { useCart } from "../store/cart";
import { useDistributor } from "../store/distributor";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const distributor = useDistributor();

  if (items.length === 0) {
    return (
      <main className="page checkout">
        <h2>订单确认</h2>
        <p className="empty-state">当前没有可结算的商品。</p>
        <Link className="primary-button" to="/">
          返回首页
        </Link>
      </main>
    );
  }

  return (
    <main className="page checkout">
      <header className="page-header">
        <div>
          <p className="muted">确认订单</p>
          <h2>提货地址</h2>
        </div>
        <Link className="ghost-link" to="/cart">
          返回购物车
        </Link>
      </header>

      <section className="pickup-card">
        <h3>{distributor.name}</h3>
        <p>{distributor.pickupAddress}</p>
        <p className="muted">根据链接后缀自动匹配分销商地址</p>
      </section>

      <section className="order-items">
        {items.map((item) => (
          <div key={item.id} className="order-item">
            <div>
              <h4>{item.name}</h4>
              <p className="muted">
                ¥{item.price.toFixed(2)} × {item.quantity}
              </p>
            </div>
            <strong>¥{(item.price * item.quantity).toFixed(2)}</strong>
          </div>
        ))}
      </section>

      <footer className="checkout-bar summary">
        <div>
          <p>总计</p>
          <strong>¥{total.toFixed(2)}</strong>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={clearCart}
        >
          确认生成订单
        </button>
      </footer>
    </main>
  );
};

export default Checkout;
