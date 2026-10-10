import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Clock,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

export const TestTakingPage = () => {
  const { id: testId } = useParams();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // answers map: questionIndex -> { selectedOptionId, isMarkedForReview }
  const [answers, setAnswers] = useState({});
  const [savingStatus, setSavingStatus] = useState('saved'); // saved, saving, error
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);

  // Initialize or resume test attempt
  useEffect(() => {
    const initTest = async () => {
      try {
        setLoading(true);
        const res = await apiClient.post(`/tests/${testId}/start`);
        if (res.data.success) {
          setTest(res.data.test);
          setAttempt(res.data.attempt);
          setRemainingSeconds(res.data.attempt.remainingSeconds || 0);

          // Restore existing saved answers
          const existingMap = {};
          if (res.data.attempt.answers) {
            res.data.attempt.answers.forEach((ans) => {
              existingMap[ans.questionIndex] = {
                selectedOptionId: ans.selectedOptionId,
                isMarkedForReview: ans.isMarkedForReview,
              };
            });
          }
          setAnswers(existingMap);
        }
      } catch (err) {
        error(err.message || 'Unable to start test attempt.');
        navigate('/student/tests');
      } finally {
        setLoading(false);
      }
    };

    initTest();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  // Countdown Timer
  useEffect(() => {
    if (remainingSeconds <= 0 && attempt) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoFinalize();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [remainingSeconds, attempt]);

  const handleAutoFinalize = async () => {
    info('Test time has elapsed! Automatically finalizing submission...');
    await performSubmit();
  };

  const saveAnswerToBackend = async (questionIndex, selectedOptionId, isMarkedForReview) => {
    if (!attempt) return;
    setSavingStatus('saving');
    try {
      await apiClient.post(`/tests/attempts/${attempt._id}/save-answer`, {
        questionIndex,
        selectedOptionId,
        isMarkedForReview,
      });
      setSavingStatus('saved');
    } catch (err) {
      setSavingStatus('error');
      console.error('Failed to autosave answer:', err);
    }
  };

  const handleSelectOption = (optionId) => {
    const currentAns = answers[currentIndex] || {};
    const updated = {
      ...answers,
      [currentIndex]: {
        ...currentAns,
        selectedOptionId: optionId,
      },
    };
    setAnswers(updated);
    saveAnswerToBackend(currentIndex, optionId, currentAns.isMarkedForReview);
  };

  const handleClearSelection = () => {
    const currentAns = answers[currentIndex] || {};
    const updated = {
      ...answers,
      [currentIndex]: {
        ...currentAns,
        selectedOptionId: null,
      },
    };
    setAnswers(updated);
    saveAnswerToBackend(currentIndex, null, currentAns.isMarkedForReview);
  };

  const handleToggleMarkForReview = () => {
    const currentAns = answers[currentIndex] || {};
    const newMark = !currentAns.isMarkedForReview;
    const updated = {
      ...answers,
      [currentIndex]: {
        ...currentAns,
        isMarkedForReview: newMark,
      },
    };
    setAnswers(updated);
    saveAnswerToBackend(currentIndex, currentAns.selectedOptionId, newMark);
  };

  const performSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post(`/tests/attempts/${attempt._id}/submit`);
      if (res.data.success) {
        success('Test attempt finalized and evaluated successfully!');
        navigate(`/student/results/${testId}`);
      }
    } catch (err) {
      error(err.message || 'Submission error.');
    } finally {
      setSubmitting(false);
      setConfirmSubmitOpen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to secure test environment..." />;
  }

  if (!test) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-slate-500">Test data could not be loaded.</p>
      </div>
    );
  }

  const currentQuestion = test.questions[currentIndex];
  const currentAnswer = answers[currentIndex] || {};

  // Compute question counts
  const totalQuestions = test.questions.length;
  let answeredCount = 0;
  let markedCount = 0;

  test.questions.forEach((_, idx) => {
    const a = answers[idx];
    if (a?.selectedOptionId) answeredCount++;
    if (a?.isMarkedForReview) markedCount++;
  });
  const unansweredCount = totalQuestions - answeredCount;

  // Format timer
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${hours > 0 ? `${hours}:` : ''}${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;

  return (
    <div className="space-y-6">
      {/* Top Test Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy-100 text-navy-800">
            {currentQuestion?.subject || test.subject}
          </span>
          <h2 className="text-lg font-bold text-slate-850 mt-1">{test.title}</h2>
        </div>

        {/* Real-time Timer Banner */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-navy-950 text-white font-mono text-base font-bold shadow-inner">
            <Clock className={`w-4 h-4 ${remainingSeconds < 300 ? 'text-rose-400 animate-pulse' : 'text-teal-400'}`} />
            <span className={remainingSeconds < 300 ? 'text-rose-300' : 'text-teal-300'}>{timeFormatted}</span>
          </div>

          <button
            onClick={() => setConfirmSubmitOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </div>

      {/* Main Examination Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Question Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-700">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <div className="flex items-center space-x-2 text-xs font-semibold">
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                  +{currentQuestion?.marks || 4} Marks
                </span>
                <span className="text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-100">
                  -{currentQuestion?.negativeMarks || 1} Penalty
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="py-6">
              <p className="text-base font-medium text-slate-850 leading-relaxed whitespace-pre-line">
                {currentQuestion?.questionText}
              </p>
            </div>

            {/* 4 Options */}
            <div className="space-y-3">
              {currentQuestion?.options.map((opt) => {
                const isSelected = currentAnswer.selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100/60'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition ${
                        isSelected
                          ? 'bg-teal-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-600'
                      }`}
                    >
                      {opt.id}
                    </div>
                    <span className="text-sm text-slate-800 leading-snug pt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleToggleMarkForReview}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${
                  currentAnswer.isMarkedForReview
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{currentAnswer.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>

              {currentAnswer.selectedOptionId && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                disabled={currentIndex === totalQuestions - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition disabled:opacity-40 flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Palette & Status Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Question Palette
            </h3>

            {/* Quick Status Pill Bar */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-5">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="block font-extrabold text-emerald-800 text-sm">{answeredCount}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Answered</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="block font-extrabold text-slate-700 text-sm">{unansweredCount}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Blank</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                <span className="block font-extrabold text-amber-800 text-sm">{markedCount}</span>
                <span className="text-[10px] text-amber-600 font-semibold">Review</span>
              </div>
            </div>

            {/* Grid Palette */}
            <div className="grid grid-cols-5 gap-2.5 max-h-64 overflow-y-auto p-1">
              {test.questions.map((_, idx) => {
                const ans = answers[idx];
                const isSelected = ans?.selectedOptionId;
                const isMarked = ans?.isMarkedForReview;
                const isCurrent = currentIndex === idx;

                let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
                if (isMarked && isSelected) {
                  colorClasses = 'bg-amber-500 text-white border-amber-600';
                } else if (isMarked) {
                  colorClasses = 'bg-amber-100 text-amber-800 border-amber-300';
                } else if (isSelected) {
                  colorClasses = 'bg-teal-600 text-white border-teal-700';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-bold border transition flex items-center justify-center relative ${colorClasses} ${
                      isCurrent ? 'ring-2 ring-teal-500 ring-offset-2' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Autosave Status */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Autosave Status:</span>
            <span className="font-semibold text-emerald-600 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Synced with Server</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setConfirmSubmitOpen(true)}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Review & Submit Test</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmSubmitOpen}
        onClose={() => setConfirmSubmitOpen(false)}
        onConfirm={performSubmit}
        title="Confirm Test Submission"
        message={`You have answered ${answeredCount} of ${totalQuestions} questions. ${
          unansweredCount > 0 ? `${unansweredCount} questions remain unanswered.` : ''
        } Are you sure you wish to finalize your attempt? You cannot modify your answers after submission.`}
        confirmText="Yes, Finalize & Submit"
        cancelText="Return to Test"
        isLoading={submitting}
      />
    </div>
  );
};
