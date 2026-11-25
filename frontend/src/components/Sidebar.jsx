import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Map, 
  MessageSquareCode, 
  BrainCircuit, 
  BarChart3, 
  UserCircle2, 
  Sparkles,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Skill Assessment', path: '/assessment', icon: GraduationCap },
    { name: 'Learning Roadmap', path: '/roadmap', icon: Map },
    { name: 'AI Tutor', path: '/tutor', icon: MessageSquareCode, highlight: true },
    { name: 'Adaptive Quizzes', path: '/quiz', icon: Award },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Student Profile', path: '/profile', icon: UserCircle2 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800/80 bg-[#0a0f1d]/50 p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Student Badge Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/70 to-slate-900/80 border border-slate-700/60 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20">
            {user?.name ? user.name[0] : 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white truncate">{user?.name || "Student"}</h4>
            <p className="text-xs text-slate-400 truncate">{user?.target_role || "Full Stack Developer"}</p>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Level:</span>
          <span className="font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {user?.experience_level || "Beginner"}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : item.highlight
                    ? 'text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
              {item.highlight && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* AI Assistant Quick Card */}
      <div className="mt-auto pt-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/20 text-center relative overflow-hidden">
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <Sparkles className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <h5 className="text-xs font-semibold text-white">Need Quick Help?</h5>
          <p className="text-[11px] text-slate-400 mt-1 mb-3">
            Ask SkillGraph AI Assistant to explain any coding concept or debug code.
          </p>
          <Link
            to="/tutor"
            className="inline-flex items-center justify-center w-full px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all"
          >
            Open AI Tutor
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
