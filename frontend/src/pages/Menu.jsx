import { useState, useEffect } from "react";
import { api } from "../api";
import { useCart } from "../context/CartContext";

const categories = ["Starters", "Main Course", "Desserts", "Beverages"];

function Menu() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [added, setAdded] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    api("/menu")
      .then(setItems)
      .catch((err) => setError(err.message));
  }, []);

  const handleAdd = (item) => {
    addToCart(item);
    setAdded(`${item.name} added to cart`);
    setTimeout(() => setAdded(""), 1500);
  };

  const available = items.filter((i) => i.available);

  return (
    <div>
      <h1>Our Menu</h1>
      {error && <div className="message error-msg">{error}</div>}
      {added && <div className="message">{added}</div>}

      {categories.map((cat) => {
        const list = available.filter((i) => i.category === cat);
        if (list.length === 0) return null;
        return (
          <div key={cat}>
            <h2>{cat}</h2>
            <div className="menu-grid">
              {list.map((item) => (
                <div className="menu-card" key={item._id}>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="menu-footer">
                    <span className="price">₹{item.price}</span>
                    <button className="btn small primary" onClick={() => handleAdd(item)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Menu;