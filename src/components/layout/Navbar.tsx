import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import threadlyLogo from "../../assets/logo-threadly.png";
import SearchBar from "../ui/SeacrhBar";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img
            src={threadlyLogo}
            alt="Threadly"
            className="navbar-logo-icon"
            style={{ width: 28, height: 28, objectFit: "contain" }}
          />
          Threadly
        </Link>

         <div className="navbar-search" style={{ flex: 1, maxWidth: 520, margin: "0 16px" }}>
          <SearchBar />
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <button className="navbar-btn" title="Notifications">
                &#128276;
              </button>
              <Link to="/profile" className="navbar-avatar" title="Profile">
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
