import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  Layers,
  FileQuestion,
  AlertTriangle,
  Award,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingDown,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const TeacherDashboard = () => {
  const [data, setData] = useState({
    analytics: null,
    batches: [],
    tests: [],
    announcements: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        const [analRes, batchesRes, testsRes, annRes] = await Promise.allSettled([
          apiClient.get('/stats/teacher'),
          apiClient.get('/batches'),
          apiClient.get('/tests'),
          apiClient.get('/announcements'),
        ]);

        setData({
          analytics: analRes.status === 'fulfilled' ? analRes.value.data : null,
          batches: batchesRes.status === 'fulfilled' ? batchesRes.value.data.batches || [] : [],
          tests: testsRes.status === 'fulfilled' ? testsRes.value.data.tests || [] : [],
          announcements: annRes.status === 'fulfilled' ? annRes.value.data.announcements || [] : [],
        });
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling faculty academic metrics..." />;
  }

  const { analytics, batches, tests, announcements } = data;

  const totalStudents = batches.reduce((sum, b) => sum + (b.studentCount || 0), 0);
  const upcomingTests = tests.filter((t) => t.computedStatus === 'upcoming');
  const decliningStudents = analytics?.decliningStudents || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Faculty Academic Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Oversee assigned classroom batches, administer Tuesday/Saturday test series, and track student improvement.
          </p>
        </div>

        <Link
          to="/teacher/tests/create"
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Test</span>
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Batches"
          value={batches.length}
          subtitle={`${totalStudents} active students enrolled`}
          icon={Layers}
          color="teal"
        />

        <StatCard
          title="Upcoming Tests"
          value={upcomingTests.length}
          subtitle="Tuesday & Saturday scheduled sessions"
          icon={Calendar}
          color="navy"
        />

        <StatCard
          title="Declining Performance"
          value={decliningStudents.length}
          subtitle="Students requiring faculty review"
          icon={TrendingDown}
          color={decliningStudents.length > 0 ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Total Test Catalog"
          value={tests.length}
          subtitle="Published and completed series"
          icon={FileQuestion}
          color="purple"
        />
      </div>

      {/* Declining Performance Alert Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-850">
                Students with Declining Recent Performance
              </h3>
              <p className="text-xs text-slate-500">
                {analytics?.comparisonRuleDescription ||
                  'Flagged if latest test percentage dropped by >= 5.0% compared to previous test.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 self-start">
            {decliningStudents.length} Flagged
          </span>
        </div>

        {decliningStudents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No students currently exhibit a drop of 5.0% or greater. Batch performance is steady.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {decliningStudents.map((st) => (
              <div
                key={st.studentId}
                className="p-4 rounded-2xl bg-rose-50/30 border border-rose-200 space-y-2 hover:bg-rose-50/60 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-850">{st.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {st.batchName}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-lg">
                    -{st.percentageDrop}% Drop
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-rose-100">
                  <span className="text-slate-500">
                    Previous: <strong>{st.previousPercentage}%</strong>
                  </span>
                  <span className="text-rose-700 font-bold">
                    Latest: <strong>{st.latestPercentage}%</strong>
                  </span>
                </div>

                <Link
                  to={`/teacher/students`}
                  className="text-[11px] font-bold text-teal-700 hover:underline flex items-center space-x-1 pt-1"
                >
                  <span>Open Student Profile & History</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Middle Grid: Batch Performance Chart & Recent Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Batch Performance Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-850">Batch Average Percentage Trends</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mean cohort scores across recently concluded tests.
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          {analytics?.batchChartData && analytics.batchChartData.length > 0 ? (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.batchChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="testTitle" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="avgPercentage" name="Avg Percentage" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Complete scheduled tests to render batch comparison charts.
            </div>
          )}
        </div>

        {/* Assigned Batches Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-850">My Assigned Batches</h3>
              <Link to="/teacher/batches" className="text-xs font-bold text-teal-700 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {batches.map((b) => (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-850">{b.name}</h4>
                    <span className="text-[10px] text-teal-700 font-semibold block">
                      Code: {b.code}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Schedule: {b.scheduleDays?.join(' & ') || 'Tuesday & Saturday'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-navy-900 block">
                      {b.studentCount || 0}
                    </span>
                    <span className="text-[10px] text-slate-400">Enrolled Students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Fee status visible to faculty in read-only mode.</span>
            <Link to="/teacher/fees" className="font-bold text-teal-700 hover:underline">
              Check Fees →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
