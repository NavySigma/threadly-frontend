import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";
import Home from "./pages/Home";
import Register from "./pages/user/Register";
import Login from "./pages/user/Login";
import EditPostPage from "./pages/user/post/EditPostPage"
import EditProfilePage from "./pages/user/EditProfilePage";
import ProfilePage from "./pages/user/ProfilePage";
import PointsHistoryPage from "./pages/user/PointsHistoryPage";
import PostDetailPage from "./pages/user/post/PostDetailPage";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TagsPage from "./pages/user/post/tags/TagsPage";
import SearchPage from "./pages/user/SearchPages";
import CreatePostPage from "./pages/user/post/CreatePostPage";
import { PostsPage } from "./pages/user/post/PostPage";
// import SearchPage from "./pages/user/SearchPages";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth pages — navbar only, no sidebar */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Main app — navbar + sidebar */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/create" element={<Home />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/posts/:id/edit" element={<EditPostPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/history" element={<PointsHistoryPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/search" element={<Home />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
