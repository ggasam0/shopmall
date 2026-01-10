import { Fragment, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api";
import DistributorNav from "../components/DistributorNav";

const DistributorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadOrders = async () => {
      try {
        const [orderList, userList] = await Promise.all([
          apiRequest("/orders"),
          apiRequest("/users")
        ]);
        if (mounted) {
          setOrders(orderList);
          setUsers(userList);
        }
      } catch (error) {
        if (mounted) {
          setOrders([]);
          setUsers([]);
        }
      }
    };
    loadOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleOrderDetail = async (order) => {
    const isExpanded = expandedOrderId === order.id;
    setExpandedOrderId(isExpanded ? null : order.id);
    if (isExpanded || order.status !== "待提货") {
      return;
    }
    setOrderMessage("");
    setOrderError("");
    try {
      const updated = await apiRequest(`/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "已完成" })
      });
      setOrders((prev) => prev.map((item) => (item.id === order.id ? updated : item)));
      setOrderMessage("查看详情后订单已自动标记为已完成");
    } catch (error) {
      setOrderError("更新订单状态失败");
    }
  };

  const phoneLookup = useMemo(
    () =>
      users.reduce((acc, user) => {
        acc[user.id] = user.phone;
        return acc;
      }, {}),
    [users]
  );
  const filteredOrders = useMemo(() => {
    const trimmed = phoneQuery.trim();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "pending" ? order.status === "待提货" : true;
      const phone = phoneLookup[order.user_id] || "";
      const matchesPhone = trimmed ? phone.includes(trimmed) : true;
      return matchesStatus && matchesPhone;
    });
  }, [orders, phoneQuery, statusFilter, phoneLookup]);

  return (
    <main className="page dashboard">
      <section className="page-header">
        <div>
          <h2>订单管理</h2>
          <p className="muted">集中查看并维护分销商订单</p>
        </div>
      </section>

      <DistributorNav />

      <section className="dashboard-panel">
        <header>
          <h3>订单列表</h3>
          <span>查看详情会自动标记为已完成</span>
        </header>
        <div className="order-filters">
          <div className="order-tabs">
            <button
              type="button"
              className={statusFilter === "all" ? "tab-button active" : "tab-button"}
              onClick={() => setStatusFilter("all")}
            >
              全部订单
            </button>
            <button
              type="button"
              className={statusFilter === "pending" ? "tab-button active" : "tab-button"}
              onClick={() => setStatusFilter("pending")}
            >
              待提货订单
            </button>
          </div>
          <label className="order-search">
            <span>手机号</span>
            <input
              type="text"
              placeholder="搜索用户手机号"
              value={phoneQuery}
              onChange={(event) => setPhoneQuery(event.target.value)}
            />
          </label>
          <span className="muted">共 {filteredOrders.length} 笔订单</span>
        </div>
        {filteredOrders.length ? (
          <table className="order-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>用户电话</th>
                <th>状态</th>
                <th>总计</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const phone = phoneLookup[order.user_id] || "未知";
                const isExpanded = expandedOrderId === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr>
                      <td>{order.order_number}</td>
                      <td>{phone}</td>
                      <td>{order.status}</td>
                      <td>¥{order.total.toFixed(2)}</td>
                      <td>
                        <div className="order-actions">
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => handleToggleOrderDetail(order)}
                          >
                            {isExpanded ? "收起详情" : "查看详情"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="order-detail-row">
                        <td colSpan={5}>
                          <div className="order-detail">
                            <div className="detail-grid">
                              <div>
                                <span className="label">用户号码</span>
                                <strong>{phone}</strong>
                              </div>
                              <div>
                                <span className="label">下单时间</span>
                                <strong>{new Date(order.created_at).toLocaleString()}</strong>
                              </div>
                              <div>
                                <span className="label">订单状态</span>
                                <strong>{order.status}</strong>
                              </div>
                              <div>
                                <span className="label">订单总计</span>
                                <strong>¥{order.total.toFixed(2)}</strong>
                              </div>
                            </div>
                            <div>
                              <p className="label">商品明细</p>
                              {(order.items || []).length ? (
                                <ul className="detail-items">
                                  {order.items.map((item) => (
                                    <li key={`${order.id}-${item.id}`}>
                                      <span>{item.name}</span>
                                      <span>
                                        ×{item.quantity} · ¥{item.price.toFixed(2)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="muted">暂无商品明细</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">暂无订单数据。</p>
        )}
        {orderError ? <p className="form-error">{orderError}</p> : null}
        {orderMessage ? <p className="form-success">{orderMessage}</p> : null}
      </section>
    </main>
  );
};

export default DistributorOrders;
