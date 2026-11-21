import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, clearCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearCart();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Restaurant Management</Link>
      <div className="nav-links">
        <Link to="/">Menu</Link>
        <Link to="/cart">Cart ({itemCount})</Link>
        {user && <Link to="/orders">My Orders</Link>}
        {user && <Link to="/reservations">Reservations</Link>}
        {user && user.role === "admin" && <Link to="/admin">Admin</Link>}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && <span className="nav-user">Hi, {user.name}</span>}
        {user && (
          <button className="btn small" onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;