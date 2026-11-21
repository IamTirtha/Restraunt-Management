import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

function Invoice() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/orders/${id}`)
      .then(setOrder)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="message error-msg">{error}</div>;
  if (!order) return <p>Loading...</p>;

  return (
    <div className="invoice">
      <div className="invoice-head">
        <h1>Restaurant Management</h1>
        <p>Tax Invoice</p>
      </div>

      <div className="order-head">
        <span><strong>Bill No:</strong> {order.orderNumber}</span>
        <span><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</span>
      </div>
      <p><strong>Customer:</strong> {order.user && order.user.name}</p>
      <p>
        <strong>Type:</strong> {order.orderType}
        {order.tableNumber && ` (Table ${order.tableNumber})`}
      </p>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.name}>
              <td>{i.name}</td>
              <td>{i.quantity}</td>
              <td>₹{i.price}</td>
              <td>₹{(i.price * i.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bill-box">
        <div className="bill-row"><span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div>
        <div className="bill-row"><span>GST (5%)</span><span>₹{order.tax.toFixed(2)}</span></div>
        <div className="bill-row bill-total"><span>Total</span><span>₹{order.total.toFixed(2)}</span></div>
      </div>

      <p className="invoice-foot">Thank you for dining with us!</p>

      <div className="btn-row no-print">
        <button className="btn primary" onClick={() => window.print()}>Print / Save as PDF</button>
        <Link className="btn" to="/orders">Back to Orders</Link>
      </div>
    </div>
  );
}

export default Invoice;