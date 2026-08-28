/* eslint-disable no-unused-vars */
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  PlusSquare,
  FileText,
  BookOpen,
  MessageSquare,
  Users,
  User,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/Authcontext";
import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/Brainera-logo.png";

export default function InstructorSidebar() {
  const [open, setOpen] = useState(false);

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // 🔐 LOGOUT
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🔗 LINK STYLE
  const linkClass = ({ isActive }) =>
    `
      flex items-center gap-3 px-4 py-3 rounded-lg
      text-sm font-medium transition-all
      ${
        isActive
          ? "bg-(--accent-primary) text-white"
          : "text-(--text-muted) hover:bg-(--bg-glass) hover:text-(--text-main)"
      }
    `;

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="
          lg:hidden fixed top-4 left-4 z-50
          bg-(--accent-primary) text-white
          p-2 rounded-lg shadow
        "
      >
        <Menu size={22} />
      </button>

      {/* OVERLAY - Click outside to close */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          aria-label="Close sidebar"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-(--bg-surface)
          border-r border-(--border-main)
          flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="border-b border-(--border-main)">
          <div className="px-6 py-6 flex flex-col items-center gap-2 relative">
            {/* Close button for mobile */}
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden absolute top-3 right-3 p-2 rounded-full bg-(--bg-glass) text-(--text-muted) hover:text-(--text-main) hover:bg-(--border-main) transition-all border border-(--border-main)"
            >
              <X size={20} />
            </button>

            <img
              src={logo}
              alt="Brainera Logo"
              className="h-15 w-auto object-contain"
            />

            <span className="text-xl font-medium tracking-wide text-(--accent-primary)">
              Instructor Panel
            </span>
          </div>
        </div>

        {/* NAVIGATION (SCROLLABLE FIX) ✅ */}
        <nav className="flex-1 flex flex-col gap-1 px-4 py-6 overflow-y-auto">
          <NavLink to="/instructor/dashboard" className={linkClass}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/instructor/create-course" className={linkClass}>
            <PlusSquare size={18} />
            Create Course
          </NavLink>

          <NavLink to="/instructor/draft-courses" className={linkClass}>
            <FileText size={18} />
            Draft Courses
          </NavLink>

          <NavLink to="/instructor/my-courses" className={linkClass}>
            <BookOpen size={18} />
            My Courses
          </NavLink>

          <NavLink to="/instructor/contact-messages" className={linkClass}>
            <MessageSquare size={18} />
            Messages
          </NavLink>

          <NavLink to="/instructor/manage-students" className={linkClass}>
            <Users size={18} />
            Students
          </NavLink>

          <NavLink to="/instructor/add-announcement" className={linkClass}>
            <Bell size={18} />
            Announcement
          </NavLink>
        </nav>

        {/* BOTTOM SECTION (SHRINK FIX) ✅ */}
        <div className="border-t border-(--border-main) p-4 space-y-3 shrink-0">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="
              w-full flex items-center justify-center gap-2
              p-2 rounded-lg
              border border-(--border-main)
              bg-(--bg-surface)
              dark:bg-(--bg-glass)
              hover:border-(--accent-primary)
              transition
            "
          >
            {theme === "light" ? (
              <>
                <Moon size={18} className="text-slate-800" />
                <span className="text-sm text-(--text-main)">Light Mode</span>
              </>
            ) : (
              <>
                <Sun size={18} className="text-yellow-400" />
                <span className="text-sm text-(--text-main)">Dark Mode</span>
              </>
            )}
          </button>

          {/* PROFILE */}
          <NavLink to="/instructor/profile" className={linkClass}>
            <User size={18} />
            Profile
          </NavLink>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-sm font-medium
              text-red-500
              hover:bg-red-50 dark:hover:bg-red-500/10
              transition
            "
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
