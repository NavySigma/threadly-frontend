import { createBrowserRouter, Outlet } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import Home from '../pages/Home'
import Register from '../pages/user/Register'
import Login from '../pages/user/Login'

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
          { path: 'register', element: <Register /> },
          { path: 'login', element: <Login /> },
        ],
      },
    ],
  },
])
