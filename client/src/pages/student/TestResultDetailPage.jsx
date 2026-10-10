import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Users,
  BookOpen,
  Info,
} from 'lucide-react';

export const TestResultDetailPage = () => {
  const { testId } = useParams();
  const [resultData, setResultData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review'); // review or leaderboard

  useEffect(() => {
    const fetchResultAndLeaderboard = async () => {
      try {
        setLoading(true);
        const [resRes, leadRes] = await Promise.allSettled([
          apiClient.get(`/results/${testId}/my-result`),
          apiClient.get(`/results/${testId}/leaderboard`),
        ]);

        if (resRes.status === 'fulfilled' && resRes.value.data.success) {
          setResultData(resRes.value.data);
        }
        if (leadRes.status === 'fulfilled' && leadRes.value.data.success) {
          setLeaderboardData(leadRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load result details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResultAndLeaderboard();
  }, [testId]);

  if (loading) {
    return <LoadingSpinner text="Loading detailed scorecard and answer review..." />;
  }

  if (!resultData) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-sm text-slate-500">Test result not found or not finalized.</p>
        <Link to="/student/results" className="text-xs font-bold text-teal-700 hover:underline">
          Return to Results
        </Link>
      </div>
    );
  }

  const { attempt, questionReview, isResultsPublished } = resultData;

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center space-x-3">
        <Link
          to="/student/results"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-navy-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Detailed Performance Scorecard
          </h2>
          <p className="text-xs text-slate-500">
            Official evaluation certified under JEE Academy Examination Rules
          </p>
        </div>
      </div>

      {/* Main Scorecard Summary Box */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-navy-850">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-1">
              Finalized Result
            </span>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-white">
                {attempt.score}
              </span>
              <span className="text-slate-400 font-semibold text-lg">
                / {attempt.maxScore} Marks
              </span>
              <span className="text-teal-300 font-bold text-xl">
                ({attempt.percentage}%)
              </span>
            </div>
          </div>

          {attempt.batchRank && (
            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-teal-950/60 border border-teal-800/80">
              <div className="w-12 h-12 rounded-xl bg-teal-500 text-navy-950 font-extrabold flex items-center justify-center text-xl shadow-md">
                #{attempt.batchRank}
              </div>
              <div>
                <span className="text-[10px] text-teal-300 uppercase font-bold tracking-wider block">
                  Official Batch Rank
                </span>
                <span className="text-xs text-slate-300">
                  Competition Ranking (Tied ranks shared)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Accuracy</span>
            <span className="text-lg font-bold text-white">{attempt.accuracy}%</span>
          </div>
          <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800">
            <span className="text-emerald-400 block text-[10px] uppercase font-bold">Correct (+Marks)</span>
            <span className="text-lg font-bold text-emerald-300">{attempt.correctCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800">
            <span className="text-rose-400 block text-[10px] uppercase font-bold">Incorrect (-Penalties)</span>
            <span className="text-lg font-bold text-rose-300">{attempt.incorrectCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Unanswered</span>
            <span className="text-lg font-bold text-slate-300">{attempt.unansweredCount}</span>
          </div>
        </div>

        {/* Subject Scores */}
        {attempt.subjectScores && (
          <div className="mt-6 pt-6 border-t border-navy-850 flex flex-wrap gap-6 text-xs text-slate-300">
            <span>Physics: <strong className="text-white text-sm">{attempt.subjectScores.Physics || 0}</strong></span>
            <span>Chemistry: <strong className="text-white text-sm">{attempt.subjectScores.Chemistry || 0}</strong></span>
            <span>Mathematics: <strong className="text-white text-sm">{attempt.subjectScores.Mathematics || 0}</strong></span>
          </div>
        )}
      </div>

      {/* Tabs: Answer Review vs Batch Leaderboard */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('review')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'review'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Question-by-Question Review & Explanations</span>
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'leaderboard'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Batch Competition Leaderboard</span>
        </button>
      </div>

      {/* Tab 1: Question Review */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {!isResultsPublished ? (
            <div className="bg-white rounded-3xl p-8 border border-amber-200 text-center space-y-3">
              <Info className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Results Pending Faculty Publication</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Detailed question explanations and official answer keys will be visible as soon as faculty publishes the batch results.
              </p>
            </div>
          ) : questionReview && questionReview.length > 0 ? (
            questionReview.map((q, idx) => {
              const isCorrect = q.isCorrect;
              const isUnanswered = !q.studentChoice;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-3xl p-6 sm:p-7 border shadow-xs space-y-4 ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isUnanswered
                      ? 'border-slate-200'
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Question {idx + 1} ({q.subject})
                    </span>
                    <div className="flex items-center space-x-2">
                      {isCorrect ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct (+{q.marks})</span>
                        </span>
                      ) : isUnanswered ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          <span>Unanswered (0)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Incorrect (-{q.negativeMarks})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-850 leading-relaxed whitespace-pre-line">
                    {q.questionText}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {q.options.map((opt) => {
                      const isStudentSelected = q.studentChoice === opt.id;
                      const isCorrectAnswer = q.correctOptionId === opt.id;

                      let optClass = 'bg-slate-50 border-slate-200 text-slate-700';
                      if (isCorrectAnswer) {
                        optClass = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold ring-1 ring-emerald-300';
                      } else if (isStudentSelected && !isCorrectAnswer) {
                        optClass = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optClass}`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="w-5 h-5 rounded-md bg-white border flex items-center justify-center font-bold text-[10px]">
                              {opt.id}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {isCorrectAnswer && (
                            <span className="text-[10px] uppercase font-bold text-emerald-700">
                              Correct Key
                            </span>
                          )}
                          {isStudentSelected && !isCorrectAnswer && (
                            <span className="text-[10px] uppercase font-bold text-rose-600">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Faculty Explanation */}
                  {q.explanation && (
                    <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs text-teal-950 space-y-1">
                      <span className="font-bold text-teal-900 block text-[11px] uppercase tracking-wider">
                        Faculty Explanation & Derivation:
                      </span>
                      <p className="leading-relaxed text-slate-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No questions found for this test.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Batch Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-850">
                {leaderboardData?.batchName || 'Batch'} Official Leaderboard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Competition ranking (1, 2, 2, 4) computed solely from academic scores.
              </p>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              Privacy protected: No contact info exposed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Percentage</th>
                  <th className="py-3 px-3">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboardData?.leaderboard?.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/60 transition ${
                      item.rank === 1 ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-extrabold text-slate-850">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-xl ${
                          item.rank === 1
                            ? 'bg-amber-400 text-navy-950 shadow-xs'
                            : item.rank === 2
                            ? 'bg-slate-200 text-slate-800'
                            : item.rank === 3
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        #{item.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{item.studentName}</td>
                    <td className="py-3 px-3 font-bold text-teal-700">
                      {item.score} / {item.maxScore}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{item.percentage}%</td>
                    <td className="py-3 px-3 text-slate-600">{item.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
