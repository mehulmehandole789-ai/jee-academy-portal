import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Users, Award, CreditCard } from 'lucide-react';

export const AdminReportsPage = () => {
  const [adminStats, setAdminStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [statsRes, batchRes] = await Promise.all([
          apiClient.get('/stats/admin'),
          apiClient.get('/batches'),
        ]);

        if (statsRes.data.success) setAdminStats(statsRes.data.overview);
        if (batchRes.data.success) setBatches(batchRes.data.batches);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Generating academy-wide reports..." />;
  }

  const toINR = (paise) => Math.round((paise || 0) / 100);

  const batchChartData = batches.map((b) => ({
    name: b.code || b.name,
    students: b.studentCount || 0,
  }));

  const feePieData = [
    { name: 'Collected Fees', value: toINR(adminStats?.totalCollectedPaise) },
    { name: 'Outstanding Balance', value: toINR(adminStats?.outstandingPaise) },
  ];
  const COLORS = ['#0d9488', '#f59e0b'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
          Academy-Wide Academic & Financial Reports
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          High-level institutional metrics, batch cohort capacity, and financial fulfillment rates.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Total Academic Capacity
          </span>
          <span className="text-2xl font-extrabold text-slate-850">
            {adminStats?.totalStudents || 0} Students
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Across active cohorts</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Collections Realized
          </span>
          <span className="text-2xl font-extrabold text-teal-700">
            ₹{toINR(adminStats?.totalCollectedPaise).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">
            {adminStats?.totalAgreedPaise > 0
              ? `${Math.round((adminStats.totalCollectedPaise / adminStats.totalAgreedPaise) * 100)}% realization rate`
              : '100%'}
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Outstanding Receivable
          </span>
          <span className="text-2xl font-extrabold text-amber-600">
            ₹{toINR(adminStats?.outstandingPaise).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Due under quarterly schedules</span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cohort Student Distribution (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-850">Student Enrollment per Batch</h3>
            <p className="text-xs text-slate-500 mt-0.5">Cohort size distribution.</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="students" name="Enrolled Students" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Realization Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-850">Fee Realization Ratio</h3>
            <p className="text-xs text-slate-500 mt-0.5">Collections vs Outstanding Balance.</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {feePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
