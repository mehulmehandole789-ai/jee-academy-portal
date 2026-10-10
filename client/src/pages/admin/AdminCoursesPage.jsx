import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { GraduationCap, Plus, Edit2, CheckCircle2 } from 'lucide-react';

export const AdminCoursesPage = () => {
  const { success, error } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    targetExamYear: 2027,
    totalFee: 15000000,
    highlights: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/courses');
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setForm({
      name: '',
      code: '',
      description: '',
      targetExamYear: 2027,
      totalFee: 15000000,
      highlights: 'Bi-weekly Tuesday & Saturday mock tests\nComplete Class 11 & 12 PCM rigorous syllabus\nDaily Problem Solving Sheets',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCourse(c);
    setForm({
      name: c.name,
      code: c.code,
      description: c.description || '',
      targetExamYear: c.targetExamYear,
      totalFee: c.totalFee,
      highlights: (c.syllabusHighlights || []).join('\n'),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      error('Course name and code are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        code: form.code,
        description: form.description,
        targetExamYear: Number(form.targetExamYear),
        totalFee: Number(form.totalFee),
        syllabusHighlights: form.highlights.split('\n').filter((h) => h.trim()),
      };

      if (editingCourse) {
        await apiClient.put(`/courses/${editingCourse._id}`, payload);
        success('Course program updated.');
      } else {
        await apiClient.post('/courses', payload);
        success('New course program created.');
      }
      setModalOpen(false);
      fetchCourses();
    } catch (err) {
      error(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const toINR = (paise) => Math.round((paise || 0) / 100).toLocaleString('en-IN');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Academic Courses & Programs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure standard agreed fee structures, target exam milestones, and curriculum points.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching course programs..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-800">
                    Code: {course.code}
                  </span>
                  <Badge variant="teal">Target {course.targetExamYear}</Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-850 mb-1">{course.name}</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{course.description}</p>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Agreed Program Fee
                  </span>
                  <span className="text-xl font-extrabold text-teal-700">₹{toINR(course.totalFee)}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Highlights:
                  </span>
                  {course.syllabusHighlights?.map((h, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => handleOpenEdit(course)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Course</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCourse ? 'Edit Course Program' : 'Create Academic Course Program'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Course Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Exam Year <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={form.targetExamYear}
                onChange={(e) => setForm({ ...form, targetExamYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Total Program Fee (in integer paise, 1 INR = 100 paise)
            </label>
            <input
              type="number"
              required
              value={form.totalFee}
              onChange={(e) => setForm({ ...form, totalFee: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Equals: ₹{toINR(form.totalFee)} INR
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Syllabus Highlights (One point per line)
            </label>
            <textarea
              rows={3}
              value={form.highlights}
              onChange={(e) => setForm({ ...form, highlights: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {saving ? 'Saving Course...' : editingCourse ? 'Save Changes' : 'Create Course'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
