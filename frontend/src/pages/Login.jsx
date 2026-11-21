import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { saveLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api("/auth/login", { method: "POST", body: form });
      saveLogin(data);
      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <div className="message error-msg">{error}</div>}

      <label>Email</label>
      <input name="email" type="email" value={form.email} onChange={handleChange} required />

      <label>Password</label>
      <input name="password" type="password" value={form.password} onChange={handleChange} required />

      <div className="btn-row">
        <button type="submit" className="btn primary">Login</button>
      </div>
      <p>New here? <Link to="/register">Create an account</Link></p>
    </form>
  );
}

export default Login;