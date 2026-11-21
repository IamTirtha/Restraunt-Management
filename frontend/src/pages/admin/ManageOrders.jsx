import { useState, useEffect } from "react";
import { api } from "../../api";

const statuses = ["Placed", "Preparing", "Ready", "Delivered", "Cancelled"];

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    api("/orders")
      .then(setOrders)
      .catch((err) => {
        setIsError(true);
        setMessage(err.message);
      });
  }, []);

  const changeStatus = async (id, status) => {
    try {
      const updated = await api(`/orders/${id}/status`, {
        method: "PUT",
        body: { status },
      });
      setOrders(orders.map((o) => (o._id === id ? updated : o)));
      setIsError(false);
      setMessage(`Order ${updated.orderNumber} marked as ${status}.`);
    } catch (err) {
      setIsError(true);
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h1>Order Management</h1>
      {message && (
        <div className={isError ? "message error-msg" : "message"}>{message}</div>
      )}

      {orders.length === 0 ? (
        <p className="empty">No orders yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Type</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>
                  {o.orderNumber}
                  <br />
                  <small>{new Date(o.createdAt).toLocaleString()}</small>
                </td>
                <td>{o.user ? o.user.name : "Deleted user"}</td>
                <td>{o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}</td>
                <td>
                  {o.orderType}
                  {o.tableNumber && ` (Table ${o.tableNumber})`}
                </td>
                <td>₹{o.total.toFixed(2)}</td>
                <td>
                  <select value={o.status} onChange={(e) => changeStatus(o._id, e.target.value)}>
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageOrders;