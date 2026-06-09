import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Register from "./pages/user/Register";
import Login from "./pages/user/Login";
import CreatePostPage from "./pages/user/CreatePostPage";
import EditPostPage from "./pages/user/EditPostPage";
import EditProfilePage from "./pages/user/EditProfilePage";
import PostDetailPage from "./pages/user/PostDetailPage";
import ProfilePage from "./pages/user/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/posts/create" element={<CreatePostPage />} />
            <Route path="/posts/:id" element={<PostDetailPage/>} />
            <Route path="/posts/:id/edit" element={<EditPostPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;