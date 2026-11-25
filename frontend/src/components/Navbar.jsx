import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  User, 
  LogOut, 
  Compass, 
  BrainCircuit, 
  CheckCircle2, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0a0f1d]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Skill<span className="text-indigo-400">Graph</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-indigo-400/80 font-medium -mt-1">
                AI Learning Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation for Authenticated User */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-white bg-slate-800/80'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/assessment"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/assessment'
                    ? 'text-white bg-slate-800/80'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Assessment
              </Link>
              <Link
                to="/roadmap"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/roadmap'
                    ? 'text-white bg-slate-800/80'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Roadmap
              </Link>
              <Link
                to="/tutor"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  location.pathname === '/tutor'
                    ? 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Tutor
              </Link>
              <Link
                to="/quiz"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/quiz'
                    ? 'text-white bg-slate-800/80'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Adaptive Quiz
              </Link>
              <Link
                to="/analytics"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/analytics'
                    ? 'text-white bg-slate-800/80'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Analytics
              </Link>
            </nav>
          )}

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all text-sm font-medium text-slate-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase">
                    {user.name ? user.name[0] : 'S'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {user.target_role || "Student"}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Student Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : !isAuthPage ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0a0f1d] px-4 pt-2 pb-6 space-y-2">
          {user ? (
            <>
              <div className="px-3 py-2 border-b border-slate-800/80 mb-2">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800/60"
              >
                Dashboard
              </Link>
              <Link
                to="/assessment"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800/60"
              >
                Skill Assessment
              </Link>
              <Link
                to="/roadmap"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800/60"
              >
                Learning Roadmap
              </Link>
              <Link
                to="/tutor"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-indigo-400 hover:bg-indigo-500/10"
              >
                AI Tutor Chatbot
              </Link>
              <Link
                to="/quiz"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800/60"
              >
                Adaptive Quiz
              </Link>
              <Link
                to="/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800/60"
              >
                Progress Analytics
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800/60"
              >
                Student Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 rounded-xl text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
