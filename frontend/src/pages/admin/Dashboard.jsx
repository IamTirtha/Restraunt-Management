import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/stats")
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {error && <div className="message error-msg">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-number">{stats ? stats.orders : "-"}</div>
          <div>Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats ? `₹${stats.revenue.toFixed(0)}` : "-"}</div>
          <div>Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats ? stats.reservations : "-"}</div>
          <div>Reservations</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats ? stats.menuItems : "-"}</div>
          <div>Menu Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats ? stats.customers : "-"}</div>
          <div>Customers</div>
        </div>
      </div>

      <h2>Manage</h2>
      <div className="stat-grid">
        <Link to="/admin/orders" className="stat-card link-card">Order Management</Link>
        <Link to="/admin/menu" className="stat-card link-card">Menu Management</Link>
        <Link to="/reservations" className="stat-card link-card">All Reservations</Link>
        <div className="stat-card disabled">Inventory (coming soon)</div>
        <div className="stat-card disabled">Sales Reports (coming soon)</div>
        <div className="stat-card disabled">Coupons (coming soon)</div>
      </div>
    </div>
  );
}

export default Dashboard;