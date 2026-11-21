import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const steps = ["Placed", "Preparing", "Ready", "Delivered"];

function Tracker({ status }) {
  if (status === "Cancelled") return <div className="badge cancelled">Cancelled</div>;
  const current = steps.indexOf(status);
  return (
    <div className="tracker">
      {steps.map((s, i) => (
        <div key={s} className={"step" + (i <= current ? " done" : "")}>{s}</div>
      ))}
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const load = () =>
      api("/orders")
        .then(setOrders)
        .catch((err) => {
          setIsError(true);
          setMessage(err.message);
        });

    load();
    const timer = setInterval(load, 10000); // live status updates
    return () => clearInterval(timer);
  }, []);

  const handleCancel = async (id) => {
    try {
      const updated = await api(`/orders/${id}/cancel`, { method: "PUT" });
      setOrders(orders.map((o) => (o._id === id ? updated : o)));
      setIsError(false);
      setMessage("Order cancelled.");
    } catch (err) {
      setIsError(true);
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h1>My Orders</h1>
      {message && (
        <div className={isError ? "message error-msg" : "message"}>{message}</div>
      )}

      {orders.length === 0 && (
        <p className="empty">No orders yet. <Link to="/">Browse the menu</Link></p>
      )}

      {orders.map((o) => (
        <div className="card" key={o._id}>
          <div className="order-head">
            <strong>{o.orderNumber}</strong>
            <span>{new Date(o.createdAt).toLocaleString()}</span>
          </div>

          <Tracker status={o.status} />

          <ul className="order-items">
            {o.items.map((i) => (
              <li key={i.name}>{i.name} × {i.quantity}: ₹{i.price * i.quantity}</li>
            ))}
          </ul>

          <p>
            {o.orderType}
            {o.tableNumber && ` (Table ${o.tableNumber})`} · <strong>Total ₹{o.total.toFixed(2)}</strong>
          </p>

          <div className="btn-row">
            <Link className="btn small" to={`/orders/${o._id}/invoice`}>View Bill</Link>
            {o.status === "Placed" && (
              <button className="btn small danger" onClick={() => handleCancel(o._id)}>
                Cancel Order
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;