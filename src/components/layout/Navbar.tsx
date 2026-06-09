import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">&#9993;</span>
          Threadly
        </Link>

        <div className="navbar-search">
          <span className="navbar-search-icon">&#128269;</span>
          <input type="text" placeholder="Search..." />
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <button className="navbar-btn" title="Notifications">
                &#128276;
              </button>
              <Link
                to="/profile"
                className="navbar-avatar"
                title="Profile"
              >
                {user.username.charAt(0).toUpperCase()}
              </Link>
              <button className="navbar-btn" onClick={logout} title="Logout">
                &#10140;
              </button>
            </div>
          ) : (
            <div className="navbar-user">
              <Link to="/login" className="navbar-auth-link">
                Log in
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ fontSize: 12, padding: "6px 10px" }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
