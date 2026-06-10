import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', icon: '&#127968;', label: 'Home' },
  { to: '/posts/create', icon: '&#128203;', label: 'Questions' },
  { to: '/tags', icon: '&#127991;', label: 'Tags' },
  { to: '/users', icon: '&#128101;', label: 'Users' },
  { to: '/categories', icon: '&#128193;', label: 'Categories' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <ul className="sidebar-nav">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              <span
                className="sidebar-link-icon"
                dangerouslySetInnerHTML={{ __html: link.icon }}
              />
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
