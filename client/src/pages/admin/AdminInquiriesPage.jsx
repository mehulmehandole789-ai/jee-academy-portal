import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Mail, Phone, Calendar, CheckCircle2, MessageSquare } from 'lucide-react';

export const AdminInquiriesPage = () => {
  const { success, error } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusVal, setStatusVal] = useState('new');
  const [updating, setUpdating] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/contact');
      if (res.data.success) {
        setInquiries(res.data.inquiries);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleOpenUpdate = (inq) => {
    setSelectedInquiry(inq);
    setAdminNotes(inq.adminNotes || '');
    setStatusVal(inq.status || 'new');
  };

  const handleSaveInquiry = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await apiClient.put(`/contact/${selectedInquiry._id}`, {
        status: statusVal,
        adminNotes,
      });
      if (res.data.success) {
        success('Inquiry status updated.');
        setSelectedInquiry(null);
        fetchInquiries();
      }
    } catch (err) {
      error(err.message || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = inquiries.filter((inq) => {
    if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Admissions Contact Inquiries
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track inquiries submitted through the public website contact form and log follow-up notes.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl text-xs font-bold self-start">
          {['all', 'new', 'contacted', 'resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${
                statusFilter === tab ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching admissions inquiries..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 text-xs text-slate-400">
          No inquiries found matching this status filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inq) => (
            <div
              key={inq._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                    {inq.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-850">{inq.name}</h3>
                    <p className="text-[11px] text-slate-400">{inq.email} • {inq.phone || 'No phone'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {inq.status === 'new' && <Badge variant="warning">New Inquiry</Badge>}
                  {inq.status === 'contacted' && <Badge variant="teal">Contacted</Badge>}
                  {inq.status === 'resolved' && <Badge variant="success">Resolved</Badge>}
                  <span className="text-[11px] text-slate-400">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="font-bold text-slate-700 block text-[11px]">
                  Subject: {inq.subject}
                </span>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{inq.message}</p>
              </div>

              {inq.adminNotes && (
                <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 text-[11px] text-teal-950">
                  <span className="font-bold">Follow-Up Notes: </span>
                  <span>{inq.adminNotes}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleOpenUpdate(inq)}
                  className="px-4 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-xs transition"
                >
                  Update Status / Add Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Inquiry Modal */}
      <Modal
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        title={`Follow-up: ${selectedInquiry?.name}`}
      >
        <form onSubmit={handleSaveInquiry} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted Candidate</option>
              <option value="resolved">Resolved / Enrolled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Internal Admission Counselor Notes
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Spoke with parents on 12th Oct, interested in Morning Batch Alpha..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {updating ? 'Saving...' : 'Save Follow-Up'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
