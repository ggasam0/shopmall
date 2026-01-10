import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api";
import { useCart } from "../store/cart";
import { useDistributor } from "../store/distributor";
import { useSupplier } from "../store/supplier";
import { buildSupplierPath } from "../utils/supplier";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const distributor = useDistributor();
  const supplier = useSupplier();
  const supplierPath = (path) => buildSupplierPath(supplier, path);
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("shopmallUser");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url
      })),
    [items]
  );

  const handleCreateOrder = async () => {
    if (!user?.id) {
      setError("请先登录后再提交订单。");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const order = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          total,
          items: orderItems
        })
      });
      setCreatedOrder(order);
      clearCart();
    } catch (err) {
      setError("订单创建失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !createdOrder) {
    return (
      <main className="page checkout">
        <h2>订单确认</h2>
        <p className="empty-state">当前没有可结算的商品。</p>
        <Link className="primary-button" to={supplierPath("/")}>
          返回首页
        </Link>
      </main>
    );
  }

  if (createdOrder) {
    return (
      <main className="page checkout">
        <h2>订单已生成</h2>
        <section className="pickup-card">
          <h3>订单号：{createdOrder.order_number}</h3>
          <p>请到线下提货点现场付款并出示订单号。</p>
          <p className="muted">提货地址：{distributor.pickupAddress}</p>
        </section>
        <Link className="primary-button" to={supplierPath("/profile")}>
          查看历史订单
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
        <Link className="ghost-link" to={supplierPath("/cart")}>
          返回购物车
        </Link>
      </header>

      <section className="pickup-card">
        <h3>{distributor.name}</h3>
        <p>{distributor.pickupAddress}</p>
        <p className="muted">到店付款提货，无需线上支付</p>
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
        <div className="checkout-actions">
          {error ? <p className="form-error">{error}</p> : null}
          {!user ? (
            <Link className="ghost-link" to={supplierPath("/login")}>
              登录后提交订单
            </Link>
          ) : null}
          <button
            className="primary-button"
            type="button"
            onClick={handleCreateOrder}
            disabled={submitting}
          >
            {submitting ? "提交中..." : "提交订单"}
          </button>
        </div>
      </footer>
    </main>
  );
};

export default Checkout;
