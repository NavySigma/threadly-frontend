import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { PostFilterProvider } from '../../contexts/PostFilterContext'

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <div className="app-content">
          <Sidebar />
          <main className="main-content">
            <PostFilterProvider>
              <Outlet />
            </PostFilterProvider>
          </main>
        </div>
      </div>
    </div>
  )
}
