import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  BookOpen,
  Plus,
  Trash2,
  FileText,
  Video,
  Download,
  ExternalLink,
  Upload,
} from 'lucide-react';

export const TeacherMaterialsPage = () => {
  const { success, error } = useToast();
  const [materials, setMaterials] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: 'Physics',
    chapter: '',
    batchId: '',
    type: 'notes',
    externalUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matsRes, batchesRes] = await Promise.all([
        apiClient.get('/materials'),
        apiClient.get('/batches'),
      ]);

      if (matsRes.data.success) {
        setMaterials(matsRes.data.materials);
      }
      if (batchesRes.data.success && batchesRes.data.batches.length > 0) {
        setBatches(batchesRes.data.batches);
        setForm((prev) => ({ ...prev, batchId: batchesRes.data.batches[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.chapter || !form.batchId) {
      error('Please complete title, chapter, and batch.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('subject', form.subject);
      formData.append('chapter', form.chapter);
      formData.append('batchId', form.batchId);
      formData.append('type', form.type);

      if (form.type === 'video_link') {
        formData.append('externalUrl', form.externalUrl);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await apiClient.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        success('Study material uploaded successfully!');
        setIsModalOpen(false);
        setForm({
          title: '',
          description: '',
          subject: 'Physics',
          chapter: '',
          batchId: batches[0]?._id || '',
          type: 'notes',
          externalUrl: '',
        });
        setSelectedFile(null);
        fetchData();
      }
    } catch (err) {
      error(err.message || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/materials/${id}`);
      success('Material deleted.');
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to delete material.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Study Materials & Lecture Content
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload PDFs, Daily Practice Problem sheets, and external lecture video masterclasses.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 self-start"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Material</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching study materials..." />
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-850">No Materials Uploaded</h3>
          <p className="text-xs text-slate-400 mt-1">Upload lecture notes or practice sheets for your batches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((mat) => (
            <div
              key={mat._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-800">
                    {mat.subject}
                  </span>
                  <Badge variant={mat.type === 'video_link' ? 'purple' : 'teal'}>
                    {mat.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-slate-850 mb-1">{mat.title}</h3>
                <p className="text-xs text-teal-700 font-semibold mb-2">Chapter: {mat.chapter}</p>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {mat.description || 'No description provided.'}
                </p>

                <div className="text-[11px] text-slate-400 mb-4">
                  Batch: <strong>{mat.batch?.name || 'Classroom Batch'}</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {new Date(mat.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(mat._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Material"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Batch Study Material"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Newton's Laws - Derivations & Advanced Problems"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Batch</label>
              <select
                required
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Mixed PCM">Mixed PCM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chapter / Topic <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.chapter}
                onChange={(e) => setForm({ ...form, chapter: e.target.value })}
                placeholder="e.g. Laws of Motion"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Material Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="notes">Class Notes (PDF)</option>
                <option value="practice_sheet">Practice Sheet / DPP</option>
                <option value="assignment">Homework Assignment</option>
                <option value="video_link">Video Lecture URL</option>
              </select>
            </div>
          </div>

          {form.type === 'video_link' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                External Video URL (YouTube / Drive) <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={form.externalUrl}
                onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select File (PDF or Image, max 15MB)
              </label>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Recommended problems, prerequisites, or derivation tips..."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {submitting ? 'Uploading Content...' : 'Publish Study Material'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
