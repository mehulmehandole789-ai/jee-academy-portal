import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  FileQuestion,
  Plus,
  Calendar,
  Clock,
  ArrowRight,
  Share2,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const TeacherTestsPage = () => {
  const { success, error } = useToast();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Publish modal state
  const [publishTargetTest, setPublishTargetTest] = useState(null);
  const [publishing, setPublishing] = useState(false);

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

  const handlePublishResults = async () => {
    if (!publishTargetTest) return;
    setPublishing(true);
    try {
      const res = await apiClient.post(`/results/${publishTargetTest._id}/publish`);
      if (res.data.success) {
        success('Test results and competition batch rankings published successfully!');
        fetchTests();
      }
    } catch (err) {
      error(err.message || 'Failed to publish results.');
    } finally {
      setPublishing(false);
      setPublishTargetTest(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Tuesday & Saturday Test Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Author mock tests, lock questions during sessions, and publish finalized batch rankings.
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

      {loading ? (
        <LoadingSpinner text="Fetching test schedule..." />
      ) : tests.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No Tests Created Yet"
          description="Create your first Tuesday or Saturday test series session for your assigned classroom batches."
          action={
            <Link
              to="/teacher/tests/create"
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm"
            >
              Author New Test
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((test) => (
            <div
              key={test._id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between card-hover"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-800">
                    {test.batch?.name || 'Batch'}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {test.isResultsPublished ? (
                      <Badge variant="success">Results Published</Badge>
                    ) : (
                      <Badge variant="warning">Results Unreleased</Badge>
                    )}
                    <Badge variant="teal">{test.subject}</Badge>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-850 mb-1">{test.title}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{test.description}</p>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-5">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Start Time (IST)</span>
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
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  {test.questions?.length || 0} Questions ({test.totalMarks} Marks)
                </span>

                <div className="flex items-center space-x-2">
                  {!test.isResultsPublished && (
                    <button
                      onClick={() => setPublishTargetTest(test)}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Publish Results</span>
                    </button>
                  )}

                  <Link
                    to={`/teacher/results/${test._id}`}
                    className="px-4 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition flex items-center space-x-1 shadow-xs"
                  >
                    <span>View Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Results Confirmation */}
      <ConfirmDialog
        isOpen={!!publishTargetTest}
        onClose={() => setPublishTargetTest(null)}
        onConfirm={handlePublishResults}
        title="Publish Official Results & Rankings"
        message={`Publishing results for "${publishTargetTest?.title}" will automatically finalize any remaining in-progress attempts, compute competition ranks (1, 2, 2, 4), and unlock student answer explanations. Proceed?`}
        confirmText="Publish Results Now"
        cancelText="Cancel"
        isLoading={publishing}
      />
    </div>
  );
};
