import { createBrowserRouter, Outlet } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import Register from '../pages/user/Register'
import CreatePostPage from '../pages/user/CreatePostPage'

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: '/register', element: <Register /> },
      { path: '/posts/create', element: <CreatePostPage /> },
    ],
  },
])
