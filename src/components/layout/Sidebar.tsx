import { NavLink } from 'react-router-dom'

// List link navigasi buat sidebar, isinya path, emoji icon, dan labelnya
const links = [
  { to: '/', icon: '&#127968;', label: 'Home' },
  { to: '/posts', icon: '&#128203;', label: 'Questions' },
  { to: '/tags', icon: '&#127991;', label: 'Tags' },
  { to: '/users', icon: '&#128101;', label: 'Users' },
  { to: '/categories', icon: '&#128193;', label: 'Categories' },
]

export default function Sidebar() {
  return (
    // Container utama sidebar pake border kanan tipis & background kontras
    <aside className="sidebar border-e border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 h-screen py-4 w-64">
      {/* List menu navigasi */}
      <ul className="sidebar-nav space-y-1">
        {links.map((link) => (
          <li key={link.to}>
            {/* NavLink otomatis ngasih state isActive kalo path-nya cocok */}
            <NavLink
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 border-s-[3px] px-4 py-3 transition-colors ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 font-semibold'
                    : 'border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:text-gray-200'
                }`
              }
            >
              {/* Icon emoji */}
              <span
                className="sidebar-link-icon size-5 opacity-75 inline-flex items-center justify-center text-base"
                dangerouslySetInnerHTML={{ __html: link.icon }}
              />
              {/* Teks label menu */}
              <span className="text-sm font-medium">{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
