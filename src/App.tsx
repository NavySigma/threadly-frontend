import "./App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";
import Home from "./pages/Home";

// ── FOLDER AUTH ──
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import AuthCallback from "./pages/auth/AuthCallback";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// ── FOLDER POST ──
import { PostsPage } from "./pages/post/vote/PostPage";
import CreatePostPage from "./pages/post/CreatePostPage";
import PostDetailPage from "./pages/post/PostDetailPage";
import EditPostPage from "./pages/post/EditPostPage";
import TagsPage from "./pages/post/tags/TagsPage";
import TagDetailPage from "./pages/post/tags/tagDetailPage";

// ── FOLDER PROFILE ──
import ProfilePage from "./pages/profile/ProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import PointsHistoryPage from "./pages/profile/history/PointsHistoryPage";

// ── FOLDER LAINNYA ──
import SearchPage from "./pages/search/SearchPages";
import NotificationsPage from "./pages/notification/NotificationsPage";
import UsersPage from "./pages/users";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── AUTH LAYOUT (Tanpa Sidebar) ── */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* ── MAIN APP LAYOUT (Navbar + Sidebar) ── */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/create" element={<CreatePostPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/posts/:id" element={<EditPostPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/profile/:id?" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/history" element={<PointsHistoryPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/tags/:id" element={<TagDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/category" element={<Navigate to="/tags" replace />} />
            <Route
              path="/categories"
              element={<Navigate to="/tags" replace />}
            />
          </Route>
          <Route
            path="/categories/"
            element={<Navigate to="/tags" replace />}
          />
          <Route
            path="/categories/"
            element={<Navigate to="/tags" replace />}
          />
          
          <Route
            path="*"
            element={
              <div className="p-12 text-center font-semibold text-gray-500">
                ⚠️ 404 | Halaman tidak ditemukan atau route salah, bro!
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
