import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";
import Home from "./pages/Home";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import EditPostPage from "./pages/post/EditPostPage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import ProfilePage from "./pages/profile/ProfilePage";
import PointsHistoryPage from "./pages/profile/history/PointsHistoryPage";
import PostDetailPage from "./pages/post/PostDetailPage";
import AuthCallback from "./pages/auth/AuthCallback";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import TagsPage from "./pages/post/tags/TagsPage";
import TagDetailPage from "./pages/post/tags/tagDetailPage";
import SearchPage from "./pages/search/SearchPages";
import CreatePostPage from "./pages/post/CreatePostPage";
import { PostsPage } from "./pages/post/vote/PostPage";


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
            <Route path="/posts/create" element={<CreatePostPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/posts/:id/edit" element={<EditPostPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/history" element={<PointsHistoryPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/tags/:id" element={<TagDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
