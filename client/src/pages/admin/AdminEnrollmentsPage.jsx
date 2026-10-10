import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Filter,
  User,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';

export const AdminEnrollmentsPage = () => {
  const { success, error } = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Approval modal state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [targetEnrollment, setTargetEnrollment] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [agreedFee, setAgreedFee] = useState(15000000);
  const [approving, setApproving] = useState(false);

  // Rejection modal state
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const [enrollRes, batchRes] = await Promise.all([
        apiClient.get('/enrollment'),
        apiClient.get('/batches'),
      ]);

      if (enrollRes.data.success) {
        setEnrollments(enrollRes.data.enrollments);
      }
      if (batchRes.data.success) {
        setBatches(batchRes.data.batches);
      }
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleOpenApprove = (enrollment) => {
    setTargetEnrollment(enrollment);
    setAgreedFee(enrollment.course?.totalFee || 15000000);
    if (batches.length > 0) setSelectedBatchId(batches[0]._id);
    setApprovalModalOpen(true);
  };

  const handleOpenReject = (enrollment) => {
    setTargetEnrollment(enrollment);
    setRejectionReason('Does not meet current academic eligibility criteria.');
    setRejectionModalOpen(true);
  };

  const submitApproval = async (e) => {
    e.preventDefault();
    if (!selectedBatchId) {
      error('Please select an active batch to allocate.');
      return;
    }

    setApproving(true);
    try {
      const res = await apiClient.put(`/enrollment/${targetEnrollment._id}/review`, {
        status: 'approved',
        batchId: selectedBatchId,
        agreedFee: Number(agreedFee),
      });

      if (res.data.success) {
        success('Enrollment approved, batch allocated, and fee account initialized!');
        setApprovalModalOpen(false);
        fetchEnrollments();
      }
    } catch (err) {
      error(err.message || 'Failed to approve enrollment.');
    } finally {
      setApproving(false);
    }
  };

  const submitRejection = async (e) => {
    e.preventDefault();
    setRejecting(true);
    try {
      const res = await apiClient.put(`/enrollment/${targetEnrollment._id}/review`, {
        status: 'rejected',
        rejectionReason,
      });

      if (res.data.success) {
        success('Application marked as rejected.');
        setRejectionModalOpen(false);
        fetchEnrollments();
      }
    } catch (err) {
      error(err.message || 'Failed to reject application.');
    } finally {
      setRejecting(false);
    }
  };

  const filtered = enrollments.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Enrollment Application Review
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review student admissions, allocate classroom batches, and initialize fee accounts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl text-xs font-bold self-start">
          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
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
        <LoadingSpinner text="Fetching applications..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 text-xs text-slate-400">
          No enrollment applications found for this filter.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Course Program</th>
                  <th className="py-3.5 px-4">Academic Background</th>
                  <th className="py-3.5 px-4">Allocated Batch</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-850">
                      <div>
                        <span>{item.student?.name}</span>
                        <span className="text-[10px] text-slate-400 block">{item.student?.email}</span>
                        <span className="text-[10px] text-slate-400 block">{item.student?.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{item.course?.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>
                        <span>{item.schoolOrCollege || 'School not stated'}</span>
                        <span className="text-[10px] text-teal-700 font-semibold block">
                          Score: {item.previousScore || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.batch ? (
                        <span className="font-semibold text-slate-800">{item.batch.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">None assigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'approved' && <Badge variant="success">Approved</Badge>}
                      {item.status === 'pending' && <Badge variant="warning">Pending Review</Badge>}
                      {item.status === 'rejected' && <Badge variant="danger">Rejected</Badge>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenApprove(item)}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenReject(item)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Reviewed by {item.reviewedBy?.name || 'Admin'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve Application Modal */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title="Approve Enrollment & Assign Batch"
      >
        <form onSubmit={submitApproval} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
            <p>
              Candidate: <strong>{targetEnrollment?.student?.name}</strong> ({targetEnrollment?.student?.email})
            </p>
            <p>
              Applying for: <strong>{targetEnrollment?.course?.name}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Active Classroom Batch <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Total Agreed Fee (in paise, 1 INR = 100 paise)
            </label>
            <input
              type="number"
              required
              value={agreedFee}
              onChange={(e) => setAgreedFee(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Equivalent in INR: ₹{Math.round(agreedFee / 100).toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="submit"
            disabled={approving}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {approving ? 'Allocating Batch...' : 'Confirm Approval & Activate Access'}
          </button>
        </form>
      </Modal>

      {/* Reject Application Modal */}
      <Modal
        isOpen={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        title="Reject Enrollment Application"
      >
        <form onSubmit={submitRejection} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              State Rejection Reason (Visible to candidate) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={rejecting}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {rejecting ? 'Processing...' : 'Confirm Rejection'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
