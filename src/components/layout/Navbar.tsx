import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import threadlyLogo from "../../assets/threadly-removebg-preview.png";
import SearchBar from "../ui/SeacrhBar";
import { Bell, Shield } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();

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
              <Link 
                to="/profile" 
                className="navbar-avatar" 
                title="Profile"
                style={{ overflow: 'hidden' }}
              >
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
                  alt={user.username}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Link>
              {user.roles?.some((r) => ["admin", "moderator"].includes(r.name)) && (
                <Link
                  to="/admin/edit-history"
                  className="navbar-btn"
                  title="Edit History"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Shield size={18} />
                </Link>
              )}
              <Link to="/notifications" className="navbar-btn" title="Notifications" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={20} />
              </Link>
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
