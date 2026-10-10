import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Compass,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

export const StudentProgressPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/stats/student');
        if (res.data.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Crunching statistical performance data..." />;
  }

  if (!stats?.hasEnoughData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Improvement & Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real test data analytics across Physics, Chemistry, and Mathematics.
          </p>
        </div>
        <EmptyState
          icon={TrendingUp}
          title="Not Enough Data Yet"
          description="You have not finalized enough tests to plot continuous improvement charts. Complete at least 2 scheduled Tuesday/Saturday tests to generate progress trends."
        />
      </div>
    );
  }

  const {
    performanceTimeline,
    subjectBreakdown,
    comparison,
    participationRate,
    overallAvgScore,
    overallAvgPercentage,
    overallAvgAccuracy,
  } = stats;

  // Chart data formatting
  const chartData = performanceTimeline.map((item, idx) => ({
    name: `Test #${idx + 1}`,
    title: item.title,
    percentage: item.percentage,
    score: item.score,
    accuracy: item.accuracy,
    rank: item.batchRank || 0,
    physics: item.subjectScores?.Physics || 0,
    chemistry: item.subjectScores?.Chemistry || 0,
    maths: item.subjectScores?.Mathematics || 0,
  }));

  const subjectBarData = [
    { subject: 'Physics', average: subjectBreakdown?.Physics?.averageScore || 0 },
    { subject: 'Chemistry', average: subjectBreakdown?.Chemistry?.averageScore || 0 },
    { subject: 'Mathematics', average: subjectBreakdown?.Mathematics?.averageScore || 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
          Improvement Progress & Benchmarking
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Historical analysis based strictly on finalized test attempts and competition evaluation.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Overall Average %
          </span>
          <span className="text-2xl font-extrabold text-teal-700">{overallAvgPercentage}%</span>
          <span className="text-[11px] text-slate-500 block mt-1">Average across all attempts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Overall Accuracy
          </span>
          <span className="text-2xl font-extrabold text-slate-850">{overallAvgAccuracy}%</span>
          <span className="text-[11px] text-slate-500 block mt-1">Correct / Attempted questions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Participation Rate
          </span>
          <span className="text-2xl font-extrabold text-navy-800">{participationRate}%</span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {stats.attemptedCount} of {stats.totalScheduledTests} scheduled tests
          </span>
        </div>

        {/* Recent Comparison Widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Recent Test vs Prior
          </span>
          {comparison?.hasComparison ? (
            <div className="flex items-center space-x-2">
              <span
                className={`text-2xl font-extrabold ${
                  comparison.percentageDelta > 0
                    ? 'text-emerald-600'
                    : comparison.percentageDelta < 0
                    ? 'text-rose-600'
                    : 'text-slate-700'
                }`}
              >
                {comparison.percentageDelta > 0 ? `+${comparison.percentageDelta}%` : `${comparison.percentageDelta}%`}
              </span>
              {comparison.trend === 'improving' && <ArrowUpRight className="w-5 h-5 text-emerald-500" />}
              {comparison.trend === 'declining' && <ArrowDownRight className="w-5 h-5 text-rose-500" />}
              {comparison.trend === 'steady' && <Minus className="w-5 h-5 text-slate-400" />}
            </div>
          ) : (
            <span className="text-xs text-slate-400">Not enough data yet</span>
          )}
          <span className="text-[11px] text-slate-500 block mt-1">
            {comparison?.hasComparison ? `${comparison.trend.toUpperCase()} trajectory` : 'Need 2 tests'}
          </span>
        </div>
      </div>

      {/* Chart 1: Percentage of Max Marks Over Time */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-850">Percentage Score Progression</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Normalizes tests with differing maximum marks to reflect genuine performance trajectory.
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                name="Score Percentage"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ fill: '#0d9488', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                name="Accuracy %"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ fill: '#3b82f6', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Subject-Wise Performance Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-850">PCM Subject Trends</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Points scored in Physics, Chemistry, and Mathematics per test.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="physics" name="Physics" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="chemistry" name="Chemistry" fill="#1e293b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maths" name="Mathematics" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Averages Bar Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-850">Cumulative Subject Averages</h3>
            <p className="text-xs text-slate-500 mt-0.5">Mean points per subject.</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="average" fill="#0d9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
