import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  BriefcaseBusiness,
  Compass,
  BookOpen,
  Map,
  Sparkles,
  FileText,
  BotMessageSquare,
  Users,
  LogOut,
  Menu,
  X,
  UserRound,
} from "lucide-react";
import { getUsername, logout } from "../utils/auth";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const username = getUsername();

  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Jobs", path: "/jobs", icon: BriefcaseBusiness },
    { label: "Job Match", path: "/job-recommendations", icon: Compass },
    { label: "Courses", path: "/courses", icon: BookOpen },
    { label: "Roadmap", path: "/roadmap", icon: Map },
    { label: "Skills", path: "/skills", icon: Sparkles },
    { label: "Resume AI", path: "/resume-analyzer", icon: FileText },
    { label: "AI Coach", path: "/ai-coach", icon: BotMessageSquare },
    { label: "Users", path: "/users", icon: Users },
  ];

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Career<span className="text-blue-600">Hub</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
              <UserRound size={15} />
            </div>
            <span className="max-w-28 truncate text-xs font-semibold text-slate-800">
              {username}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <UserRound size={17} />
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
