import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";

export default function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  const addToCart = (item) =>
    setCart((prev) => {
      const found = prev.find((c) => c._id === item._id);
      if (found) {
        return prev.map((c) =>
          c._id === item._id ? { ...c, quantity: Math.min(c.quantity + 1, 20) } : c
        );
      }
      return [...prev, { _id: item._id, name: item.name, price: item.price, quantity: 1 }];
    });

  // delta is +1 or -1; an item reaching 0 is removed
  const changeQuantity = (id, delta) =>
    setCart((prev) =>
      prev
        .map((c) => (c._id === id ? { ...c, quantity: Math.min(c.quantity + delta, 20) } : c))
        .filter((c) => c.quantity > 0)
    );

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c._id !== id));
  const clearCart = () => setCart([]);

  const itemCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, changeQuantity, removeFromCart, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}