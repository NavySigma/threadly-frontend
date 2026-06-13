import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  FileText, 
  Tag, 
  Users, 
  Folder, 
  Coins,
  Rocket
} from "lucide-react";

const links = [
  { to: "/", icon: <Home size={20} />, label: "Home" },
  { to: "/posts", icon: <FileText size={20} />, label: "Questions" },
  { to: "/tags", icon: <Tag size={20} />, label: "Tags" },
  { to: "/users", icon: <Users size={20} />, label: "Users" },
  { to: "/categories", icon: <Folder size={20} />, label: "Categories" },
  { to: "/history", icon: <Coins size={20} />, label: "History Points" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-sm sticky top-0">
      {/* Header */}
      <div className="px-5 py-5 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          Threadly
        </h2>

        <p className="text-xs text-gray-400 mt-1">
          Community Discussion Platform
        </p>
      </div>

      {/* Navigation */}
      <ul className="p-3 space-y-1">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => {
                let active = isActive;

                if (location.pathname === "/posts/create") {
                  if (link.to === "/") active = true;
                  if (link.to === "/posts") active = false;
                } else if (link.to === "/") {
                  active = location.pathname === "/";
                }

                return `
                  group
                  flex items-center gap-3
                  rounded-xl
                  px-4 py-3
                  transition-all duration-200
                  ${
                    active
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                  }
                `;
              }}
            >
              <div
                className={`
                  flex items-center justify-center
                  transition-all
                `}
              >
                {link.icon}
              </div>

              <span className="text-sm font-medium tracking-wide">
                {link.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Threadly Community
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
            <span>Ask, Answer, Learn</span>
            <Rocket size={12} className="text-indigo-500" />
          </div>
        </div>
      </div>
    </aside>
  );
}