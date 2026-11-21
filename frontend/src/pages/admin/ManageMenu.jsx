import { useState, useEffect } from "react";
import { api } from "../../api";

const emptyItem = {
  name: "",
  description: "",
  category: "Starters",
  price: "",
  imageUrl: "",
  available: true,
};

function ManageMenu() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    api("/menu")
      .then(setItems)
      .catch((err) => {
        setIsError(true);
        setMessage(err.message);
      });
  }, []);

  const showMessage = (text, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await api(`/menu/${editingId}`, { method: "PUT", body: form });
        setItems(items.map((i) => (i._id === editingId ? updated : i)));
        showMessage("Menu item updated.");
      } else {
        const created = await api("/menu", { method: "POST", body: form });
        setItems([...items, created]);
        showMessage("Menu item added.");
      }
      setForm(emptyItem);
      setEditingId(null);
    } catch (err) {
      showMessage(err.message, true);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      imageUrl: item.imageUrl,
      available: item.available,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await api(`/menu/${id}`, { method: "DELETE" });
      setItems(items.filter((i) => i._id !== id));
      showMessage("Menu item deleted.");
    } catch (err) {
      showMessage(err.message, true);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyItem);
  };

  return (
    <div>
      <h1>Menu Management</h1>
      {message && (
        <div className={isError ? "message error-msg" : "message"}>{message}</div>
      )}

      <form className="card" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Menu Item" : "Add Menu Item"}</h2>

        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Description</label>
        <input name="description" value={form.description} onChange={handleChange} />

        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          <option>Starters</option>
          <option>Main Course</option>
          <option>Desserts</option>
          <option>Beverages</option>
        </select>

        <label>Price (₹)</label>
        <input type="number" min="0" name="price" value={form.price} onChange={handleChange} required />

        <label>Image URL (optional)</label>
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />

        <label className="check-label">
          <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
          Available
        </label>

        <div className="btn-row">
          <button type="submit" className="btn primary">
            {editingId ? "Save Changes" : "Add Item"}
          </button>
          {editingId && (
            <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </form>

      <h2>All Menu Items</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>₹{item.price}</td>
              <td>{item.available ? "Yes" : "No"}</td>
              <td>
                <button className="btn small" onClick={() => handleEdit(item)}>Edit</button>
                <button className="btn small danger" onClick={() => handleDelete(item._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageMenu;