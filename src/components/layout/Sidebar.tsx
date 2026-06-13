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
        <p className="text-xs text-gray-400 mt-1">
          Community Discussion Platform
        </p>
      </div>

      {/* Navigation */}
      <ul className="p-3 space-y-1">
        {links.map((link) => {
          // Tentukan apakah link aktif di sini
          let isActive = location.pathname === link.to;
          if (location.pathname === "/posts/create") {
            if (link.to === "/") isActive = true;
            if (link.to === "/posts") isActive = false;
          } else if (link.to === "/") {
            isActive = location.pathname === "/";
          }

          return (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={`
                  group
                  flex items-center gap-3
                  rounded-xl
                  px-4 py-3
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#f0fdfa] text-[#0d9488] shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-[#0d9488] dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                  }
                `}
              >
                <div
                  className={`
                    flex items-center justify-center
                    transition-all
                    ${
                      isActive
                        ? "text-[#0d9488]"
                        : "text-gray-400 group-hover:text-[#0d9488]"
                    }
                  `}
                >
                  {link.icon}
                </div>

                <span className="text-sm font-medium tracking-wide">
                  {link.label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
        <a 
          href="/" 
          className="block rounded-xl bg-gray-50 dark:bg-gray-900 p-3 hover:bg-gray-100 transition-colors"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Threadly Community
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
            <span>Ask, Answer, Learn</span>
            <Rocket size={12} className="text-[#0d9488]" />
          </div>
        </a>
      </div>
    </aside>
  );
}