import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import {
  FileQuestion,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
} from 'lucide-react';

export const StudentTestsPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, live, upcoming, completed

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tests');
      if (res.data.success) {
        setTests(res.data.tests);
      }
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const filteredTests = tests.filter((t) => {
    if (filter === 'live') return t.computedStatus === 'live';
    if (filter === 'upcoming') return t.computedStatus === 'upcoming';
    if (filter === 'completed') return t.attemptStatus === 'submitted' || t.computedStatus === 'completed';
    return true;
  });

  const getStatusBadge = (test) => {
    if (test.computedStatus === 'cancelled') {
      return <Badge variant="danger">Cancelled</Badge>;
    }
    if (test.attemptStatus === 'submitted') {
      return <Badge variant="success">Completed</Badge>;
    }
    if (test.attemptStatus === 'in_progress') {
      return <Badge variant="warning">Attempt In Progress</Badge>;
    }
    if (test.computedStatus === 'live') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>LIVE NOW</span>
        </span>
      );
    }
    if (test.computedStatus === 'upcoming') {
      return <Badge variant="teal">Upcoming</Badge>;
    }
    if (test.attemptStatus === 'missed') {
      return <Badge variant="default">Missed</Badge>;
    }
    return <Badge variant="default">Concluded</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Tuesday & Saturday Test Series
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Timed NTA-style online mock examinations strictly scoped to your classroom batch.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-200/60 rounded-xl text-xs font-bold self-start">
          {['all', 'live', 'upcoming', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${
                filter === tab ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching test schedule..." />
      ) : filteredTests.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No Tests Found"
          description="There are currently no tests matching your selected category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTests.map((test) => {
            const isLive = test.computedStatus === 'live';
            const isUpcoming = test.computedStatus === 'upcoming';
            const hasSubmitted = test.attemptStatus === 'submitted';
            const isInProgress = test.attemptStatus === 'in_progress';

            return (
              <div
                key={test._id}
                className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all flex flex-col justify-between ${
                  isLive ? 'border-rose-300 shadow-md ring-2 ring-rose-500/10' : 'border-slate-200 shadow-xs card-hover'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-800">
                      {test.subject}
                    </span>
                    {getStatusBadge(test)}
                  </div>

                  <h3 className="text-lg font-bold text-slate-850 mb-1 leading-snug">{test.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-5 line-clamp-2">
                    {test.description || 'Full syllabus evaluation.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-5">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Time</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(test.startDate).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                      <span className="font-semibold text-slate-800">{test.durationMinutes} Minutes</span>
                    </div>
                  </div>

                  {hasSubmitted && test.myAttempt && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center mb-5">
                      <span className="text-emerald-800 font-semibold">Your Score:</span>
                      <span className="font-extrabold text-emerald-900 text-sm">
                        {test.myAttempt.score} / {test.myAttempt.maxScore} ({test.myAttempt.percentage}%)
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Questions: {test.questions?.length || 6} MCQs (+4/-1)
                  </span>

                  {isLive && !hasSubmitted && (
                    <Link
                      to={`/student/tests/${test._id}/take`}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isInProgress ? 'Resume Attempt' : 'Start Test Now'}</span>
                    </Link>
                  )}

                  {isUpcoming && (
                    <span className="text-xs font-semibold text-slate-400">
                      Opens on {new Date(test.startDate).toLocaleDateString()}
                    </span>
                  )}

                  {hasSubmitted && (
                    <Link
                      to={`/student/results/${test._id}`}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <span>View Test Result</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
