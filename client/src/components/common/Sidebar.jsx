import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileQuestion,
  Award,
  TrendingUp,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Bell,
  User,
  Users,
  Layers,
  GraduationCap,
  ClipboardList,
  LogOut,
  FolderKanban,
  FileText,
  Mail,
  BarChart3,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Enrollment Applications', path: '/admin/enrollments', icon: ClipboardList },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Courses', path: '/admin/courses', icon: GraduationCap },
        { name: 'Batches', path: '/admin/batches', icon: Layers },
        { name: 'Fee & Payment Ledger', path: '/admin/fees', icon: CreditCard },
        { name: 'Notices & Exam Updates', path: '/admin/announcements', icon: Bell },
        { name: 'Contact Inquiries', path: '/admin/inquiries', icon: Mail },
        { name: 'Academic Reports', path: '/admin/reports', icon: BarChart3 },
      ];
    }

    if (user.role === 'teacher') {
      return [
        { name: 'Faculty Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
        { name: 'Assigned Batches', path: '/teacher/batches', icon: Layers },
        { name: 'Student Roster', path: '/teacher/students', icon: Users },
        { name: 'Test Management', path: '/teacher/tests', icon: FileQuestion },
        { name: 'Study Materials', path: '/teacher/materials', icon: BookOpen },
        { name: 'Fee Status (Read-Only)', path: '/teacher/fees', icon: CreditCard },
        { name: 'Announcements', path: '/teacher/announcements', icon: Bell },
        { name: 'My Profile', path: '/teacher/profile', icon: User },
      ];
    }

    // Student items
    return [
      { name: 'My Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Tuesday & Saturday Tests', path: '/student/tests', icon: FileQuestion },
      { name: 'Results & Rankings', path: '/student/results', icon: Award },
      { name: 'Improvement Progress', path: '/student/progress', icon: TrendingUp },
      { name: 'Study Materials', path: '/student/materials', icon: BookOpen },
      { name: 'Daily Study Planner', path: '/student/planner', icon: CalendarCheck },
      { name: 'Fee Records', path: '/student/fees', icon: CreditCard },
      { name: 'Announcements', path: '/student/announcements', icon: Bell },
      { name: 'My Profile', path: '/student/profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-navy-950 text-slate-300 w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-18 px-5 border-b border-navy-850">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-navy-950 font-bold shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold text-white tracking-tight block leading-tight">
              JEE ACADEMY
            </span>
            <span className="text-[10px] font-semibold text-teal-400 tracking-wider uppercase block">
              {user?.role === 'admin' ? 'Admin Portal' : user?.role === 'teacher' ? 'Faculty Portal' : 'Student Portal'}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-850 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-navy-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-navy-850 bg-navy-900/60">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-teal-300 shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col shrink-0 fixed inset-y-0 left-0 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 z-50 flex animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
