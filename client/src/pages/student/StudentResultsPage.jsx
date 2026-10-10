import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Award, ArrowRight, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

export const StudentResultsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/stats/student');
        if (res.data.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling finalized test results..." />;
  }

  const timeline = stats?.performanceTimeline || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
          Results & Batch Rankings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review your scored mock tests, subject score breakdown, competition batch rankings, and full answer keys.
        </p>
      </div>

      {timeline.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Finalized Results Yet"
          description="Complete your scheduled Tuesday or Saturday tests to view evaluation scorecards and rank certificates."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {timeline.map((att) => (
            <div
              key={att.testId}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-800">
                    {att.subject || 'Mixed PCM'}
                  </span>
                  {att.batchRank ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      Batch Rank #{att.batchRank}
                    </span>
                  ) : (
                    <Badge variant="warning">Rank Pending</Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-850 mb-1 leading-snug">{att.title}</h3>
                <span className="text-[11px] text-slate-400 block mb-5">
                  Concluded on {new Date(att.date).toLocaleDateString()}
                </span>

                <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center mb-5">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Score</span>
                    <span className="font-extrabold text-slate-850 text-sm">
                      {att.score} / {att.maxScore}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Percentage</span>
                    <span className="font-extrabold text-teal-700 text-sm">{att.percentage}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Accuracy</span>
                    <span className="font-extrabold text-slate-850 text-sm">{att.accuracy}%</span>
                  </div>
                </div>

                {att.subjectScores && (
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
                    <span>Physics: <strong className="text-slate-800">{att.subjectScores.Physics || 0}</strong></span>
                    <span>Chemistry: <strong className="text-slate-800">{att.subjectScores.Chemistry || 0}</strong></span>
                    <span>Maths: <strong className="text-slate-800">{att.subjectScores.Mathematics || 0}</strong></span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <Link
                  to={`/student/results/${att.testId}`}
                  className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-sm"
                >
                  <span>Detailed Scorecard & Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
