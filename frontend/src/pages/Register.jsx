import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const { saveLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: { name: form.name, email: form.email, password: form.password },
      });
      saveLogin(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <h2>Create Account</h2>
      {error && <div className="message error-msg">{error}</div>}

      <label>Name</label>
      <input name="name" value={form.name} onChange={handleChange} required />

      <label>Email</label>
      <input name="email" type="email" value={form.email} onChange={handleChange} required />

      <label>Password (min 6 characters)</label>
      <input name="password" type="password" value={form.password} onChange={handleChange} required />

      <label>Confirm Password</label>
      <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required />

      <div className="btn-row">
        <button type="submit" className="btn primary">Register</button>
      </div>
      <p>Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}

export default Register;