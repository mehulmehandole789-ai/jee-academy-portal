import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const TeacherCreateTestPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    batchId: '',
    subject: 'Mixed PCM',
    startDate: '',
    startTime: '10:00',
    durationMinutes: 180,
    instructions: 'Each question carries +4 marks for correct answer and -1 mark penalty for incorrect answer. No negative marks for unanswered questions.',
    allowExceptionalDate: false,
  });

  // Dynamic Question Builder State (Default with 2 questions to start)
  const [questions, setQuestions] = useState([
    {
      questionText: 'A particle moves in a circle of radius 20 cm with a linear speed of 10 m/s. Its angular velocity is:',
      subject: 'Physics',
      options: [
        { id: 'A', text: '25 rad/s' },
        { id: 'B', text: '50 rad/s' },
        { id: 'C', text: '100 rad/s' },
        { id: 'D', text: '200 rad/s' },
      ],
      correctOptionId: 'B',
      explanation: 'ω = v / r = 10 / 0.2 = 50 rad/s.',
      marks: 4,
      negativeMarks: 1,
    },
    {
      questionText: 'Which orbital has two nodal planes?',
      subject: 'Chemistry',
      options: [
        { id: 'A', text: 's orbital' },
        { id: 'B', text: 'p orbital' },
        { id: 'C', text: 'd orbital' },
        { id: 'D', text: 'f orbital' },
      ],
      correctOptionId: 'C',
      explanation: 'The number of angular nodes (nodal planes) is given by l. For d-orbitals, l = 2.',
      marks: 4,
      negativeMarks: 1,
    },
  ]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/batches');
        if (res.data.success && res.data.batches.length > 0) {
          setBatches(res.data.batches);
          setForm((prev) => ({ ...prev, batchId: res.data.batches[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load batches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        subject: form.subject === 'Mixed PCM' ? 'Physics' : form.subject,
        options: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' },
        ],
        correctOptionId: 'A',
        explanation: '',
        marks: 4,
        negativeMarks: 1,
      },
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) {
      error('A test must contain at least 1 question.');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx, field, value) => {
    const copy = [...questions];
    copy[idx][field] = value;
    setQuestions(copy);
  };

  const handleUpdateOption = (qIdx, optId, text) => {
    const copy = [...questions];
    copy[qIdx].options = copy[qIdx].options.map((o) =>
      o.id === optId ? { ...o, text } : o
    );
    setQuestions(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.batchId || !form.startDate || !form.startTime) {
      error('Please complete title, batch, date, and start time.');
      return;
    }

    // Verify all questions have text and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        error(`Question #${i + 1} text cannot be empty.`);
        return;
      }
      for (const opt of q.options) {
        if (!opt.text.trim()) {
          error(`Question #${i + 1} option ${opt.id} text is required.`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      // Build ISO UTC timestamp combining date and time
      const combinedDateTime = new Date(`${form.startDate}T${form.startTime}:00`);

      const payload = {
        title: form.title,
        description: form.description,
        batchId: form.batchId,
        subject: form.subject,
        startDate: combinedDateTime.toISOString(),
        durationMinutes: Number(form.durationMinutes),
        instructions: form.instructions,
        questions,
        allowExceptionalDate: form.allowExceptionalDate,
      };

      const res = await apiClient.post('/tests', payload);
      if (res.data.success) {
        success('Test created and published successfully!');
        navigate('/teacher/tests');
      }
    } catch (err) {
      error(err.message || 'Failed to create test.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading authoring workspace..." />;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <Link
          to="/teacher/tests"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-navy-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Author Online Test Session
          </h2>
          <p className="text-xs text-slate-500">
            Standard Format: Single-choice MCQs (4 options) with positive score and negative penalty.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Test Metadata Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Test Details & Scheduling
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Test Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Tuesday Mock Test #5 - Mechanics & Thermodynamics"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Batch <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="Mixed PCM">Mixed PCM</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date (Asia/Kolkata) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Time (IST) <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Duration (in minutes) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={15}
                max={360}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            {/* Exceptional date checkbox */}
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="exceptionalDate"
                checked={form.allowExceptionalDate}
                onChange={(e) => setForm({ ...form, allowExceptionalDate: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <label htmlFor="exceptionalDate" className="text-xs text-slate-600 font-medium">
                Confirm exceptional date (allow scheduling outside standard Tuesday/Saturday)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instructions for Aspirants
            </label>
            <textarea
              rows={2}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        {/* Question Builder */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-850">
                Single-Correct MCQ Questions ({questions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Four options (A, B, C, D) supported. Total marks:{' '}
                <strong>{questions.reduce((sum, q) => sum + (Number(q.marks) || 4), 0)}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4 relative"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-navy-900 text-teal-300 flex items-center justify-center text-xs font-bold">
                      {qIdx + 1}
                    </span>
                    <select
                      value={q.subject}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'subject', e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-xs">
                      <label className="text-slate-500 font-semibold text-[11px]">+Marks:</label>
                      <input
                        type="number"
                        value={q.marks}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'marks', e.target.value)}
                        className="w-12 px-1.5 py-0.5 rounded border border-slate-200 text-xs text-center"
                      />
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      <label className="text-slate-500 font-semibold text-[11px]">-Penalty:</label>
                      <input
                        type="number"
                        value={q.negativeMarks}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'negativeMarks', e.target.value)}
                        className="w-12 px-1.5 py-0.5 rounded border border-slate-200 text-xs text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Question Stem Text
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={q.questionText}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'questionText', e.target.value)}
                    placeholder="Type question stem, problem statement, or diagram description..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* 4 Options */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Options & Correct Answer Key
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                          q.correctOptionId === opt.id
                            ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={q.correctOptionId === opt.id}
                          onChange={() => handleUpdateQuestion(qIdx, 'correctOptionId', opt.id)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-bold text-xs text-slate-700 w-4">{opt.id}</span>
                        <input
                          type="text"
                          required
                          value={opt.text}
                          onChange={(e) => handleUpdateOption(qIdx, opt.id, e.target.value)}
                          placeholder={`Option ${opt.id} text`}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Explanation / Solution Derivation (Shown to students after results release)
                  </label>
                  <textarea
                    rows={2}
                    value={q.explanation}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                    placeholder="Provide step-by-step mathematical or chemical proof..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200">
          <Link
            to="/teacher/tests"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {submitting ? 'Creating Test Session...' : 'Publish Test Series Session'}
          </button>
        </div>
      </form>
    </div>
  );
};
