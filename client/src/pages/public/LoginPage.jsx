import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GraduationCap, LogIn, Key, Mail, ShieldAlert, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.name}!`);

      // Determine redirect path
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else {
        navigate(user.activeBatch ? '/student/dashboard' : '/enrollment-status', { replace: true });
      }
    } catch (err) {
      error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 text-teal-400 mx-auto flex items-center justify-center shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to JEE Portal
          </h2>
          <p className="text-xs text-slate-500">
            Access your test series, rankings, study materials, and daily planner
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Section */}
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-900">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>1-Click Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@jeeacademy.com', 'Admin@123')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-teal-200 text-teal-900 font-semibold hover:bg-teal-100/60 text-left transition"
            >
              👑 Admin Desk
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('verma.physics@jeeacademy.com', 'Teacher@123')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-teal-200 text-teal-900 font-semibold hover:bg-teal-100/60 text-left transition"
            >
              👨‍🏫 Physics Faculty
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('aarav.patel@student.com', 'Student@123')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-teal-200 text-teal-900 font-semibold hover:bg-teal-100/60 text-left transition"
            >
              🎓 Student (Enrolled)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('kavya.sen@student.com', 'Student@123')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-teal-200 text-teal-900 font-semibold hover:bg-teal-100/60 text-left transition"
            >
              ⏳ Student (Pending)
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            <LogIn className="w-4 h-4 text-teal-400" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-bold text-teal-700 hover:underline">
            Register as a Student
          </Link>
        </div>
      </div>
    </div>
  );
};
