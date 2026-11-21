import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const TAX_RATE = 0.05; // must match the backend

function Cart() {
  const { cart, changeQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState("Dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const placeOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (orderType === "Dine-in" && !tableNumber.trim()) {
      setError("Please enter your table number");
      return;
    }
    setPlacing(true);
    setError("");
    try {
      await api("/orders", {
        method: "POST",
        body: {
          items: cart.map((c) => ({ menuItemId: c._id, quantity: c.quantity })),
          orderType,
          tableNumber,
          notes,
        },
      });
      clearCart();
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div>
        <h1>Your Cart</h1>
        <p className="empty">Your cart is empty. <Link to="/">Browse the menu</Link></p>
      </div>
    );
  }

  return (
    <div>
      <h1>Your Cart</h1>
      {error && <div className="message error-msg">{error}</div>}

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>₹{c.price}</td>
              <td>
                <button className="btn small" onClick={() => changeQuantity(c._id, -1)}>−</button>
                <span className="qty">{c.quantity}</span>
                <button className="btn small" onClick={() => changeQuantity(c._id, 1)}>+</button>
              </td>
              <td>₹{c.price * c.quantity}</td>
              <td>
                <button className="btn small danger" onClick={() => removeFromCart(c._id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="card">
        <h2>Order Details</h2>

        <label>Order Type</label>
        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
          <option>Dine-in</option>
          <option>Takeaway</option>
        </select>

        {orderType === "Dine-in" && (
          <>
            <label>Table Number</label>
            <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
          </>
        )}

        <label>Special Instructions (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="bill-box">
          <div className="bill-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="bill-row"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div className="bill-row bill-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
        </div>

        <div className="btn-row">
          <button className="btn primary" onClick={placeOrder} disabled={placing}>
            {placing ? "Placing..." : user ? "Place Order" : "Login to Place Order"}
          </button>
          <button className="btn" onClick={clearCart}>Clear Cart</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;