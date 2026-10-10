import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  LogOut,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const EnrollmentStatusPage = () => {
  const { user, refreshUser, logout } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [enrollment, setEnrollment] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    courseId: '',
    schoolOrCollege: '',
    previousScore: '',
    guardianName: '',
    guardianPhone: '',
    notes: '',
  });

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      const [enrollRes, courseRes] = await Promise.all([
        apiClient.get('/enrollment/my'),
        apiClient.get('/courses'),
      ]);

      if (enrollRes.data.enrollment) {
        setEnrollment(enrollRes.data.enrollment);
      }
      if (courseRes.data.courses) {
        setCourses(courseRes.data.courses);
        if (courseRes.data.courses.length > 0) {
          setForm((prev) => ({
            ...prev,
            courseId: user?.desiredCourse?._id || courseRes.data.courses[0]._id,
          }));
        }
      }
    } catch (err) {
      console.error('Enrollment fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.courseId) {
      error('Please select a course.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/enrollment/apply', form);
      if (res.data.success) {
        success('Enrollment application submitted successfully!');
        setEnrollment(res.data.enrollment);
      }
    } catch (err) {
      error(err.message || 'Application submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProceedToDashboard = async () => {
    await refreshUser();
    navigate('/student/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Retrieving enrollment status..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
              Student Admission Status
            </span>
            <h1 className="text-xl font-bold text-slate-850">
              Welcome, {user?.name}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* State 1: APPROVED */}
        {enrollment?.status === 'approved' && (
          <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-sm space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Application Approved
              </span>
              <h2 className="text-2xl font-bold text-slate-850 mt-2">
                Batch Allocation Confirmed!
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Your application for <span className="font-semibold text-slate-800">{enrollment.course?.name}</span> has been reviewed and approved by the academic admissions committee.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Allocated Batch:</span>
                <span className="font-bold text-slate-800">{enrollment.batch?.name || 'Classroom Batch'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch Code:</span>
                <span className="font-bold text-teal-700">{enrollment.batch?.code || 'ACTIVE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Test Days:</span>
                <span className="font-bold text-slate-800">Every Tuesday & Saturday</span>
              </div>
            </div>

            <button
              onClick={handleProceedToDashboard}
              className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>Access Student Portal & Tests</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* State 2: PENDING */}
        {enrollment?.status === 'pending' && (
          <div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Awaiting Administration Approval
              </span>
              <h2 className="text-2xl font-bold text-slate-850 mt-2">
                Application Under Active Review
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Your application has been received and queued for review. In accordance with academy policy, classroom tests, rankings, and study materials unlock once an administrator approves your seat and assigns an active batch.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Application Summary
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Program:</span>
                <span className="font-semibold text-slate-800">{enrollment.course?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">School/College:</span>
                <span className="font-semibold text-slate-800">{enrollment.schoolOrCollege || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Previous Exam Score:</span>
                <span className="font-semibold text-slate-800">{enrollment.previousScore || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted On:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(enrollment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
              <p className="font-semibold mb-0.5">Faculty Desk Demonstration Tip:</p>
              <p>
                To approve this student right now, log into the <span className="font-bold">Admin Portal</span> (<code className="bg-white/60 px-1 py-0.5 rounded">admin@jeeacademy.com</code>) and navigate to <span className="font-bold">Enrollment Applications</span>.
              </p>
            </div>
          </div>
        )}

        {/* State 3: REJECTED */}
        {enrollment?.status === 'rejected' && (
          <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-sm space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                Application Not Approved
              </span>
              <h2 className="text-2xl font-bold text-slate-850 mt-2">
                Eligibility Feedback
              </h2>
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 mt-4 text-xs text-rose-900">
                <p className="font-bold mb-1">Reason Stated by Administration:</p>
                <p>{enrollment.rejectionReason || 'Does not meet current course batch prerequisites.'}</p>
              </div>
            </div>

            <button
              onClick={() => setEnrollment(null)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition"
            >
              Submit a Revised Application
            </button>
          </div>
        )}

        {/* State 4: NO APPLICATION YET */}
        {!enrollment && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Step 2 of 2
              </span>
              <h2 className="text-2xl font-bold text-slate-850">
                Submit Enrollment Application
              </h2>
              <p className="text-xs text-slate-500">
                Provide your prior academic details so administration can match you to the optimal classroom batch.
              </p>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Desired Program <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} (₹{Math.round(c.totalFee / 100).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current School or College
                  </label>
                  <input
                    type="text"
                    value={form.schoolOrCollege}
                    onChange={(e) => setForm({ ...form, schoolOrCollege: e.target.value })}
                    placeholder="e.g. DPS R.K. Puram"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class 10 / 12 Percentage or Grade
                  </label>
                  <input
                    type="text"
                    value={form.previousScore}
                    onChange={(e) => setForm({ ...form, previousScore: e.target.value })}
                    placeholder="e.g. 95.4% CBSE"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={form.guardianName}
                    onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                    placeholder="e.g. Dr. R. Patel"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="tel"
                    value={form.guardianPhone}
                    onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                    placeholder="e.g. +91 98765 00000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Notes or Preferred Batch Timing
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Mention preferred morning or evening timing, or scholarship requests..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 pt-8">
        JEE Academy Student Enrollment System • Asia/Kolkata
      </div>
    </div>
  );
};
