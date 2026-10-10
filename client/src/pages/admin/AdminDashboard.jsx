import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import {
  Users,
  GraduationCap,
  Layers,
  ClipboardList,
  CreditCard,
  FileQuestion,
  Bell,
  Mail,
  ArrowRight,
  Plus,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/stats/admin');
        if (res.data.success) {
          setStats(res.data.overview);
        }
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling academy administration overview..." />;
  }

  const toINR = (paise) => Math.round((paise || 0) / 100).toLocaleString('en-IN');

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Academy Administration Headquarters
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            System control center for admissions, faculty assignments, financial ledgers, and academic reports.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          <Link
            to="/admin/enrollments"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Review Applications</span>
          </Link>
          <Link
            to="/admin/fees"
            className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
          >
            <CreditCard className="w-4 h-4 text-teal-400" />
            <span>Record Payment</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled across classroom batches"
          icon={Users}
          color="teal"
        />

        <StatCard
          title="Faculty Teachers"
          value={stats?.totalTeachers || 0}
          subtitle="Assigned subject specialists"
          icon={GraduationCap}
          color="navy"
        />

        <StatCard
          title="Active Batches"
          value={stats?.totalBatches || 0}
          subtitle="Classroom cohorts running"
          icon={Layers}
          color="purple"
        />

        <StatCard
          title="Pending Applications"
          value={stats?.pendingEnrollments || 0}
          subtitle="Awaiting admin approval"
          icon={ClipboardList}
          color={stats?.pendingEnrollments > 0 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Fee Collections to Date"
          value={`₹${toINR(stats?.totalCollectedPaise)}`}
          subtitle="Recorded payment receipts"
          icon={CreditCard}
          color="emerald"
        />

        <StatCard
          title="Total Agreed Fees"
          value={`₹${toINR(stats?.totalAgreedPaise)}`}
          subtitle="Contracted student fees"
          icon={CreditCard}
          color="teal"
        />

        <StatCard
          title="Outstanding Balance"
          value={`₹${toINR(stats?.outstandingPaise)}`}
          subtitle="Remaining receivable balance"
          icon={CreditCard}
          color="amber"
        />

        <StatCard
          title="Upcoming Scheduled Tests"
          value={stats?.upcomingTestsCount || 0}
          subtitle="Bi-weekly test series calendar"
          icon={FileQuestion}
          color="navy"
        />
      </div>

      {/* Quick Action Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Quick Administrative Navigation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <Link
            to="/admin/enrollments"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-300 transition flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-bold text-slate-850">Enrollment Review</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Approve seats & assign batches</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
          </Link>

          <Link
            to="/admin/users"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-300 transition flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-bold text-slate-850">User Management</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Manage students and teachers</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
          </Link>

          <Link
            to="/admin/fees"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-300 transition flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-bold text-slate-850">Fee Ledger</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Post receipts & audit payments</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
          </Link>

          <Link
            to="/admin/announcements"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-300 transition flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-bold text-slate-850">Exam Bulletins</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Publish verified NTA updates</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
};
