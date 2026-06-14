import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import threadlyLogo from "../../assets/threadly-removebg-preview.png";
import SearchBar from "../ui/SeacrhBar";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "../../api/notification.api";

export default function Navbar() {
  const { user } = useAuth();

  const { data: notifData } = useQuery({
    queryKey: ["navbar-unread-count"],
    queryFn: async () => {
      const res = await notificationApi.getNotifications({ is_done: false });
      // Handle both old and new backend format
      if (res?.meta?.unread_count !== undefined) return res.meta.unread_count;
      return (res as any)?.unread_count ?? 0;
    },
    staleTime: 60 * 1000,
    enabled: !!user,
  });
  const unreadCount = typeof notifData === "number" ? notifData : 0;

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
              <Link to="/notifications" className="navbar-btn" title="Notifications" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
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
