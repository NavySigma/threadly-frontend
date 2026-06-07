import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import AppLayout from "../components/layout/AppLayout";
import Home from "../pages/Home";
import Register from "../pages/user/Register";
import CreatePostPage from "../pages/user/CreatePostPage";
import Login from "../pages/user/Login";
import EditPostPage from "../pages/user/EditPostPage";

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "register", element: <Register /> },
          { path: "login", element: <Login /> },
          { path: "posts/create", element: <CreatePostPage /> },
          { path: "posts/:id/edit", element: <EditPostPage /> },
        ],
      },
    ],
  },
]);
