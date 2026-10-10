import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Layers, Plus, Edit2, Users, Calendar } from 'lucide-react';

export const AdminBatchesPage = () => {
  const { success, error } = useToast();
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    course: '',
    startDate: '',
    endDate: '',
    scheduleDays: 'Tuesday, Saturday',
    teachers: [],
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [batchRes, courseRes, teacherRes] = await Promise.all([
        apiClient.get('/batches'),
        apiClient.get('/courses'),
        apiClient.get('/auth/users?role=teacher'),
      ]);

      if (batchRes.data.success) setBatches(batchRes.data.batches);
      if (courseRes.data.success) {
        setCourses(courseRes.data.courses);
        if (courseRes.data.courses.length > 0) {
          setForm((prev) => ({ ...prev, course: courseRes.data.courses[0]._id }));
        }
      }
      if (teacherRes.data.success) setTeachers(teacherRes.data.users);
    } catch (err) {
      console.error('Failed to load batch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingBatch(null);
    setForm({
      name: '',
      code: '',
      course: courses[0]?._id || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      scheduleDays: 'Tuesday, Saturday',
      teachers: [],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBatch(b);
    setForm({
      name: b.name,
      code: b.code,
      course: b.course?._id || '',
      startDate: new Date(b.startDate).toISOString().split('T')[0],
      endDate: b.endDate ? new Date(b.endDate).toISOString().split('T')[0] : '',
      scheduleDays: b.scheduleDays?.join(', ') || 'Tuesday, Saturday',
      teachers: b.teachers?.map((t) => t._id) || [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.course || !form.startDate) {
      error('Name, code, course, and start date are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        code: form.code,
        course: form.course,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        scheduleDays: form.scheduleDays.split(',').map((s) => s.trim()).filter(Boolean),
        teachers: form.teachers,
      };

      if (editingBatch) {
        await apiClient.put(`/batches/${editingBatch._id}`, payload);
        success('Batch updated successfully.');
      } else {
        await apiClient.post('/batches', payload);
        success('New batch cohort created.');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      error(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTeacher = (tId) => {
    setForm((prev) => ({
      ...prev,
      teachers: prev.teachers.includes(tId)
        ? prev.teachers.filter((id) => id !== tId)
        : [...prev.teachers, tId],
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Classroom Cohort Batches
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Group students into scheduled batches and assign specialized physics, chemistry, and maths faculty.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Batch</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching cohort batches..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {batches.map((batch) => (
            <div
              key={batch._id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-800">
                    {batch.code}
                  </span>
                  <Badge variant="teal">{batch.studentCount || 0} Students Enrolled</Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-850 mb-1">{batch.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{batch.course?.name}</p>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheduled Days:</span>
                    <span className="font-semibold text-teal-800">
                      {batch.scheduleDays?.join(' & ') || 'Tuesday & Saturday'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Faculty Assigned:</span>
                    <span className="font-semibold text-slate-800">
                      {batch.teachers?.map((t) => t.name).join(', ') || 'None assigned yet'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {new Date(batch.startDate).toLocaleDateString()} - {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'Active'}
                </span>
                <button
                  onClick={() => handleOpenEdit(batch)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Batch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Batch Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBatch ? 'Edit Batch Cohort' : 'Create New Classroom Batch'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Batch Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Batch Alpha - Target JEE 2027 (Morning)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Batch Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. ALPHA-2027"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Program <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Test & Schedule Days (Comma separated)
            </label>
            <input
              type="text"
              value={form.scheduleDays}
              onChange={(e) => setForm({ ...form, scheduleDays: e.target.value })}
              placeholder="Tuesday, Saturday"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          {/* Assign Faculty Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Assign Faculty Teachers
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-xl border border-slate-200 bg-slate-50">
              {teachers.map((t) => {
                const isSelected = form.teachers.includes(t._id);
                return (
                  <label
                    key={t._id}
                    className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTeacher(t._id)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300"
                    />
                    <span>{t.name} ({t.email})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingBatch ? 'Save Batch Changes' : 'Create Batch Cohort'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
