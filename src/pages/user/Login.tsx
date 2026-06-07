import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ username, password });
      navigate("/");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">&#9993;</div>
        </div>
        <h2>Log in to Threadly</h2>

        {error && (
          <p
            style={{
              color: "var(--red)",
              fontSize: 13,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-submit">
            Log in
          </button>
        </form>

        <div className="form-footer">
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
