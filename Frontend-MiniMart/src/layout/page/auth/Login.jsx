import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ROLE_DEFAULT_ROUTE } from "../../../config/permissions";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    try {
      const result = await login({ username: username.trim(), password: password.trim() });
      const role = result?.user?.role;
      const target = ROLE_DEFAULT_ROUTE[role] ?? "/";
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <img
              src="https://cdn-icons-png.flaticon.com/128/11272/11272927.png"
              alt="Mini Mart"
              className="mb-3"
              style={{ height: "64px" }}
            />
            <h1 className="h4">Mini Mart POS</h1>
            <p className="text-muted">Sign in to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="d-grid gap-3">
            <div>
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-control"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <div className="alert alert-danger mb-0">{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <div className="mt-4 small text-muted">
            <p className="mb-1">Demo users</p>
            <ul className="mb-0 ps-3">
              <li>admin / admin</li>
              <li>manager / manager</li>
              <li>cashier / cashier</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
