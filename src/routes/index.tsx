import { createBrowserRouter, Outlet } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import Register from '../pages/user/Register'

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: '/register', element: <Register /> },
    ],
  },
])
