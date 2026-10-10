import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Pin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const AdminAnnouncementsPage = () => {
  const { success, error } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'academy',
    issuingOrganization: 'JEE Academy Official',
    officialSourceUrl: '',
    deadline: '',
    targetAudience: 'all',
    isPinned: false,
    status: 'published',
  });
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingAnn(null);
    setForm({
      title: '',
      description: '',
      category: 'examination',
      issuingOrganization: 'NTA / JEE Main',
      officialSourceUrl: '',
      deadline: '',
      targetAudience: 'all',
      isPinned: false,
      status: 'published',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (ann) => {
    setEditingAnn(ann);
    setForm({
      title: ann.title,
      description: ann.description,
      category: ann.category,
      issuingOrganization: ann.issuingOrganization,
      officialSourceUrl: ann.officialSourceUrl || '',
      deadline: ann.deadline ? new Date(ann.deadline).toISOString().split('T')[0] : '',
      targetAudience: ann.targetAudience || 'all',
      isPinned: !!ann.isPinned,
      status: ann.status || 'published',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      error('Title and description are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        deadline: form.deadline ? new Date(form.deadline) : undefined,
      };

      if (editingAnn) {
        await apiClient.put(`/announcements/${editingAnn._id}`, payload);
        success('Announcement bulletin updated.');
      } else {
        await apiClient.post('/announcements', payload);
        success('Notice published to student and teacher portals.');
      }
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      error(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/announcements/${id}`);
      success('Announcement removed.');
      fetchAnnouncements();
    } catch (err) {
      error(err.message || 'Failed to delete announcement.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Notices & Examination Bulletin Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Publish verified official updates from NTA, IIT JEE Advanced, CBSE, and Academy Administration.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice / Exam Bulletin</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching notice board..." />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className={`bg-white rounded-3xl p-6 border transition flex flex-col justify-between ${
                ann.isPinned ? 'border-teal-300 ring-2 ring-teal-500/10' : 'border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-800">
                      {ann.issuingOrganization}
                    </span>
                    <Badge variant={ann.category === 'examination' ? 'purple' : 'teal'}>
                      {ann.category.toUpperCase()}
                    </Badge>
                    {ann.isPinned && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Pin className="w-3 h-3" />
                        <span>Pinned</span>
                      </span>
                    )}
                    <Badge variant={ann.status === 'published' ? 'success' : 'default'}>
                      {ann.status}
                    </Badge>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Published: {new Date(ann.publicationDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-850 mb-1">{ann.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4 whitespace-pre-line">
                  {ann.description}
                </p>

                {ann.deadline && (
                  <div className="inline-flex items-center space-x-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-4">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Deadline: <strong>{new Date(ann.deadline).toLocaleDateString()}</strong></span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {ann.officialSourceUrl && (
                    <a
                      href={ann.officialSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-teal-700 hover:underline flex items-center space-x-1"
                    >
                      <span>Official Source Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(ann)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAnn ? 'Edit Notice Bulletin' : 'Publish Academy / Examination Notice'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="examination">Examination Notice</option>
                <option value="academy">Academy Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Issuing Organization</label>
              <input
                type="text"
                required
                value={form.issuingOrganization}
                onChange={(e) => setForm({ ...form, issuingOrganization: e.target.value })}
                placeholder="e.g. NTA / JEE Main"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Portal URL</label>
              <input
                type="url"
                value={form.officialSourceUrl}
                onChange={(e) => setForm({ ...form, officialSourceUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date (Optional)</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Body Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="flex items-center space-x-4 pt-2">
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded border-slate-300"
              />
              <span>Pin to Top of Feed</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingAnn ? 'Save Changes' : 'Publish Notice Bulletin'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
