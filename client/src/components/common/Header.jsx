import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, Layers, ShieldCheck, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = ({ onOpenSidebar, pageTitle }) => {
  const { user } = useAuth();

  const getAnnouncementsLink = () => {
    if (user?.role === 'admin') return '/admin/announcements';
    if (user?.role === 'teacher') return '/teacher/announcements';
    return '/student/announcements';
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 sm:h-18 flex items-center justify-between px-4 sm:px-8 shadow-xs">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-850 leading-tight">
            {pageTitle || 'Dashboard'}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Asia/Kolkata (IST) Academy Timezone
          </p>
        </div>
      </div>

      {/* Right: Batch info, notifications, user tag */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Active batch badge for students */}
        {user?.role === 'student' && user?.activeBatch && (
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>{user.activeBatch.name || 'Active Batch'}</span>
          </div>
        )}

        {/* Demo banner */}
        <span className="hidden lg:inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Demo Data Mode</span>
        </span>

        {/* Notification Bell */}
        <Link
          to={getAnnouncementsLink()}
          className="p-2 rounded-xl text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition relative"
          title="Announcements & Notices"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
        </Link>

        {/* User Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-navy-900 text-teal-300 flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
              {user?.name}
            </p>
            <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
