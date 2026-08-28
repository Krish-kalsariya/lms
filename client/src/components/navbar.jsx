import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/Authcontext.jsx";
import { ChevronDown, Moon, Sun, Bell, Menu, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/Brainera-logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false);
  const dropdownTimerRef = useRef(null);

  // 🔔 STUDENT ANNOUNCEMENT STATUS
  useEffect(() => {
    if (user?.role === "student") {
      api
        .get("/announcements/unread-status")
        .then((res) => setHasUnreadAnnouncements(res.data.hasUnread))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  // ⏱️ AUTO CLOSE PROFILE DROPDOWN (3 SECONDS)
  useEffect(() => {
    if (profileOpen) {
      dropdownTimerRef.current = setTimeout(() => {
        setProfileOpen(false);
      }, 3000);
    }

    return () => {
      if (dropdownTimerRef.current) {
        clearTimeout(dropdownTimerRef.current);
      }
    };
  }, [profileOpen]);

  // CLOSE DROPDOWN ON ROUTE CHANGE
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // HIDE NAVBAR ONLY FOR INSTRUCTOR ROUTES (not based on user role)
  const isInstructorRoute = location.pathname.startsWith("/instructor");
  
  // Sirf instructor routes par navbar hide karo, role check mat karo
  if (isInstructorRoute) return null;

  const handleLogout = async () => {
    try {
      const res = await api.post("/users/logout");
      if (res.data.success) {
        logout();
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `
      px-4 py-2 rounded-lg text-sm font-medium transition-all
      ${
        isActive
          ? "text-(--accent-primary) bg-(--bg-glass)"
          : "text-(--text-muted) hover:text-(--text-main) hover:bg-(--bg-glass)"
      }
    `;

  return (
    <header
      key={theme}
      className="
        sticky top-0 z-50
        backdrop-blur-xl
        bg-(--bg-glass)
        border-b border-(--border-main)
        transition-colors duration-300
      "
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="h-15 w-auto object-contain transition-all duration-300 hover:scale-105"
            />
          </Link>

          {/* CENTER NAV - DESKTOP */}
          <nav className="hidden md:flex items-center gap-1">
            {!user && (
              <>
                <NavLink to="/" className={navLinkClass}>Home</NavLink>
                <NavLink to="/courses" className={navLinkClass}>Courses</NavLink>
                <NavLink to="/about" className={navLinkClass}>About</NavLink>
                <NavLink to="/blog" className={navLinkClass}>Blog</NavLink>
                <NavLink to="/contact" className={navLinkClass}>Contact Us</NavLink>
                <NavLink to="/faq" className={navLinkClass}>FAQ</NavLink>
              </>
            )}

            {user?.role === "student" && (
              <>
                <NavLink to="/" className={navLinkClass}>Home</NavLink>
                <NavLink to="/courses" className={navLinkClass}>Courses</NavLink>
                <NavLink to="/about" className={navLinkClass}>About</NavLink>
                <NavLink to="/blog" className={navLinkClass}>Blog</NavLink>
                <NavLink to="/contact" className={navLinkClass}>Contact Us</NavLink>
                <NavLink to="/faq" className={navLinkClass}>FAQ</NavLink>
              </>
            )}
          </nav>

          {/* RIGHT SIDE - DESKTOP */}
          <div className="hidden md:flex items-center gap-3">

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="
                p-2 rounded-lg
                bg-(--bg-glass)
                border border-(--border-main)
                text-(--text-main)
                hover:border-(--accent-primary)
                transition
              "
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* ANNOUNCEMENT BELL */}
            {user?.role === "student" && (
              <Link
                to="/student/announcements"
                className="
                  relative p-2 rounded-lg
                  bg-(--bg-glass)
                  border border-(--border-main)
                  hover:border-(--accent-primary)
                "
              >
                <Bell size={18} />
                {hasUnreadAnnouncements && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-(--accent-primary) text-white text-[10px] flex items-center justify-center">
                    New
                  </span>
                )}
              </Link>
            )}

            {/* LOGIN / REGISTER */}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="
                    px-4 py-2 rounded-lg text-sm font-semibold
                    bg-(--bg-glass)
                    border border-(--border-main)
                    text-(--text-main)
                    hover:border-(--accent-primary)
                    transition
                  "
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="
                    px-4 py-2 rounded-lg text-sm font-semibold text-white
                    bg-linear-to-r from-violet-600 to-cyan-500
                    shadow-md hover:shadow-lg transition
                  "
                >
                  Register
                </Link>
              </>
            )}

            {/* PROFILE */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-(--bg-glass)"
                >
                  <div className="h-9 w-9 rounded-full bg-linear-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt="profile"
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      user.name?.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="text-left leading-tight">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <span className="text-xs capitalize text-(--accent-primary)">
                      {user.role}
                    </span>
                  </div>

                  <ChevronDown size={16} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-52 rounded-xl bg-(--bg-surface) border border-(--border-main) shadow-lg overflow-hidden">
                    <Link to="/student/profile" className="block px-4 py-3 text-sm hover:bg-(--bg-glass)">
                      Profile
                    </Link>
                    <Link to="/student/saved-courses" className="block px-4 py-3 text-sm hover:bg-(--bg-glass)">
                      Saved Courses
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-(--bg-glass)"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-lg border border-(--border-main)"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* MOBILE NAV */}
        {mobileOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-(--border-main)">

            {!user && (
              <>
                <NavLink to="/" className="block px-4 py-2">Home</NavLink>
                <NavLink to="/courses" className="block px-4 py-2">Courses</NavLink>
                <NavLink to="/about" className="block px-4 py-2">About</NavLink>
                <NavLink to="/blog" className="block px-4 py-2">Blog</NavLink>
                <NavLink to="/contact" className="block px-4 py-2">Contact Us</NavLink>
                <NavLink to="/faq" className="block px-4 py-2">FAQ</NavLink>

                <div className="pt-2 border-t border-(--border-main)">
                  <Link to="/login" className="block px-4 py-2">Login</Link>
                  <Link to="/register" className="block px-4 py-2">Register</Link>
                </div>
              </>
            )}

            {user?.role === "student" && (
              <>
                <NavLink to="/" className="block px-4 py-2">Home</NavLink>
                <NavLink to="/courses" className="block px-4 py-2">Courses</NavLink>
                <NavLink to="/about" className="block px-4 py-2">About</NavLink>
                <NavLink to="/blog" className="block px-4 py-2">Blog</NavLink>
                <NavLink to="/contact" className="block px-4 py-2">Contact Us</NavLink>
                <NavLink to="/faq" className="block px-4 py-2">FAQ</NavLink>

                {/* Announcements link with bell and badge */}
                <Link
                  to="/student/announcements"
                  className="flex items-center justify-between px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span>Announcements</span>
                  </div>
                  {hasUnreadAnnouncements && (
                    <span className="bg-(--accent-primary) text-white text-xs px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </Link>

                <div className="pt-2 border-t border-(--border-main)">
                  <Link to="/student/profile" className="block px-4 py-2">Profile</Link>
                  <Link to="/student/saved-courses" className="block px-4 py-2">Saved Courses</Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-500"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}

            {/* Mobile Theme Toggle */}
            <div className="pt-2 border-t border-(--border-main)">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-(--bg-surface) hover:bg-(--bg-glass) border border-(--border-main) transition"
              >
                {theme === "light" ? (
                  <Moon size={22} className="text-slate-800" />
                ) : (
                  <Sun size={22} className="text-yellow-400" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}