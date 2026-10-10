import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import {
  FileQuestion,
  Award,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle,
  ExternalLink,
  Download,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    tests: [],
    stats: null,
    tasks: [],
    materials: [],
    feeSummary: null,
    announcements: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [testsRes, statsRes, tasksRes, matsRes, feeRes, annRes] = await Promise.allSettled([
          apiClient.get('/tests'),
          apiClient.get('/stats/student'),
          apiClient.get('/tasks'),
          apiClient.get('/materials'),
          apiClient.get('/fees/my'),
          apiClient.get('/announcements'),
        ]);

        setData({
          tests: testsRes.status === 'fulfilled' ? testsRes.value.data.tests || [] : [],
          stats: statsRes.status === 'fulfilled' ? statsRes.value.data : null,
          tasks: tasksRes.status === 'fulfilled' ? tasksRes.value.data.tasks || [] : [],
          tasksSummary: tasksRes.status === 'fulfilled' ? tasksRes.value.data.summary : null,
          materials: matsRes.status === 'fulfilled' ? matsRes.value.data.materials || [] : [],
          feeSummary: feeRes.status === 'fulfilled' ? feeRes.value.data : null,
          announcements: annRes.status === 'fulfilled' ? annRes.value.data.announcements || [] : [],
        });
      } catch (err) {
        console.error('Dashboard data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading student dashboard & analytics..." />;
  }

  // Find next upcoming or live test
  const liveTest = data.tests.find((t) => t.computedStatus === 'live' && t.attemptStatus !== 'submitted');
  const nextUpcomingTest = data.tests
    .filter((t) => t.computedStatus === 'upcoming')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];

  const primaryTestCard = liveTest || nextUpcomingTest;

  // Latest test result
  const recentCompletedAttempt = data.stats?.performanceTimeline?.slice(-1)[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {user?.activeBatch?.name || 'Classroom Batch'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {user?.desiredCourse?.name}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Your next scheduled test, rankings, daily revision tasks, and batch materials are ready below.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/student/tests"
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <span>Test Series Schedule</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Latest Published Rank"
          value={recentCompletedAttempt?.batchRank ? `#${recentCompletedAttempt.batchRank}` : '—'}
          subtitle={recentCompletedAttempt ? `in ${recentCompletedAttempt.title}` : 'Complete a test to get ranked'}
          icon={Award}
          color="teal"
        />

        <StatCard
          title="Recent Score"
          value={recentCompletedAttempt ? `${recentCompletedAttempt.percentage}%` : '—'}
          subtitle={recentCompletedAttempt ? `${recentCompletedAttempt.score}/${recentCompletedAttempt.maxScore} marks` : 'No attempts yet'}
          icon={FileQuestion}
          color="navy"
        />

        <StatCard
          title="Today's Planner"
          value={`${data.tasksSummary?.todayCompleted || 0}/${data.tasksSummary?.todayTotal || 0}`}
          subtitle={`${data.tasksSummary?.todayCompletionPercentage || 0}% completed today`}
          icon={CalendarCheck}
          color="emerald"
        />

        <StatCard
          title="Fee Balance"
          value={
            data.feeSummary?.hasAccount
              ? `₹${Math.round(data.feeSummary.balance / 100).toLocaleString('en-IN')}`
              : '₹0'
          }
          subtitle={
            data.feeSummary?.status === 'paid'
              ? 'Settled in full'
              : data.feeSummary?.nextInstallment
              ? `Next due: ${new Date(data.feeSummary.nextInstallment.dueDate).toLocaleDateString()}`
              : 'Account active'
          }
          icon={CreditCard}
          color={data.feeSummary?.status === 'overdue' ? 'rose' : 'purple'}
        />
      </div>

      {/* Middle Grid: Next Test & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Next Test Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Scheduled Test Focus
              </span>
              {liveTest ? (
                <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>TEST IS LIVE NOW</span>
                </span>
              ) : (
                <Badge variant="teal">Upcoming Session</Badge>
              )}
            </div>

            {primaryTestCard ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-850">{primaryTestCard.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{primaryTestCard.description || 'Full syllabus test simulation.'}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Subject</span>
                    <span className="font-bold text-slate-800">{primaryTestCard.subject}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                    <span className="font-bold text-slate-800">{primaryTestCard.durationMinutes} Minutes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
                    <span className="font-bold text-teal-700">
                      {new Date(primaryTestCard.startDate).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Single-choice MCQs (+4 for correct, -1 penalty for incorrect).</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active tests scheduled right now. Check back Tuesday or Saturday.
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/student/tests"
              className="text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
            >
              View Full Test Calendar →
            </Link>
            {primaryTestCard && (
              <Link
                to={`/student/tests/${primaryTestCard._id}/take`}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 shadow-sm ${
                  liveTest
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-navy-900 hover:bg-navy-800 text-white'
                }`}
              >
                <span>{liveTest ? 'Enter Live Test Room' : 'View Test Instructions'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Subject-Wise Performance Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Subject Averages
              </span>
              <Link to="/student/progress" className="text-xs font-bold text-teal-700 hover:underline">
                Analytics →
              </Link>
            </div>

            {data.stats?.hasEnoughData ? (
              <div className="space-y-4">
                {/* Physics */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700">Physics Average Score</span>
                    <span className="text-teal-700">{data.stats.subjectBreakdown?.Physics?.averageScore || 0} pts</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((data.stats.subjectBreakdown?.Physics?.averageScore || 0) / 24) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Chemistry */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700">Chemistry Average Score</span>
                    <span className="text-teal-700">{data.stats.subjectBreakdown?.Chemistry?.averageScore || 0} pts</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-navy-600 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((data.stats.subjectBreakdown?.Chemistry?.averageScore || 0) / 24) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Mathematics */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700">Mathematics Average Score</span>
                    <span className="text-teal-700">{data.stats.subjectBreakdown?.Mathematics?.averageScore || 0} pts</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((data.stats.subjectBreakdown?.Mathematics?.averageScore || 0) / 24) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 leading-relaxed">
                <AlertCircle className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p>Not enough data yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Complete your scheduled Tuesday & Saturday mock tests to unlock subject radar analytics.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Accuracy Trend:</span>
            <span className="font-bold text-slate-800">
              {data.stats?.overallAvgAccuracy ? `${data.stats.overallAvgAccuracy}%` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Materials & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Study Materials */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-850">Batch Study Materials</h3>
            <Link to="/student/materials" className="text-xs font-bold text-teal-700 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {data.materials.slice(0, 3).map((mat) => (
              <div
                key={mat._id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-850 truncate">{mat.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {mat.subject} • {mat.chapter}
                    </p>
                  </div>
                </div>

                {mat.storedFileName ? (
                  <a
                    href={`/api/materials/${mat._id}/download`}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 transition shrink-0 ml-2"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                ) : mat.externalUrl ? (
                  <a
                    href={mat.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 transition shrink-0 ml-2"
                    title="Open Video Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Latest Announcements */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-850">Notices & Exam Updates</h3>
            <Link to="/student/announcements" className="text-xs font-bold text-teal-700 hover:underline">
              All Notices →
            </Link>
          </div>

          <div className="space-y-3">
            {data.announcements.slice(0, 3).map((ann) => (
              <div
                key={ann._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 hover:border-teal-200 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy-100 text-navy-800">
                    {ann.issuingOrganization}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(ann.publicationDate).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-850 leading-snug line-clamp-1">{ann.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{ann.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
