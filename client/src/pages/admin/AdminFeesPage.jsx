import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  CreditCard,
  Plus,
  Search,
  AlertTriangle,
  RotateCcw,
  Receipt,
  CheckCircle2,
} from 'lucide-react';

export const AdminFeesPage = () => {
  const { success, error } = useToast();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  // Payment Recording Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amountINR: 75000,
    method: 'UPI',
    reference: '',
    note: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [recording, setRecording] = useState(false);

  // Cancel Payment Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelPaymentId, setCancelPaymentId] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/batches');
      if (res.data.success && res.data.batches.length > 0) {
        setBatches(res.data.batches);
        setSelectedBatch(res.data.batches[0]._id);
      }
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchFeeStatuses = async () => {
    if (!selectedBatch) return;
    try {
      setLoadingStatuses(true);
      const res = await apiClient.get(`/fees/batch/${selectedBatch}`);
      if (res.data.success) {
        setStatuses(res.data.statuses);
      }
    } catch (err) {
      console.error('Failed to load batch fee statuses:', err);
    } finally {
      setLoadingStatuses(false);
    }
  };

  useEffect(() => {
    fetchFeeStatuses();
  }, [selectedBatch]);

  const handleOpenRecordPayment = (student) => {
    setSelectedStudentForPay(student);
    setPaymentForm({
      amountINR: student.balance > 0 ? Math.round(student.balance / 100) : 50000,
      method: 'UPI',
      reference: '',
      note: 'Installment payment received',
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amountINR || Number(paymentForm.amountINR) <= 0) {
      error('Please enter a valid payment amount.');
      return;
    }

    setRecording(true);
    try {
      const payload = {
        studentId: selectedStudentForPay.studentId,
        amount: Math.round(Number(paymentForm.amountINR) * 100), // convert to paise
        method: paymentForm.method,
        reference: paymentForm.reference,
        note: paymentForm.note,
        paymentDate: paymentForm.paymentDate,
      };

      const res = await apiClient.post('/fees/payment', payload);
      if (res.data.success) {
        success('Payment recorded and audit entry logged successfully!');
        setPaymentModalOpen(false);
        fetchFeeStatuses();
      }
    } catch (err) {
      error(err.message || 'Payment recording failed.');
    } finally {
      setRecording(false);
    }
  };

  const toINR = (paise) => Math.round((paise || 0) / 100).toLocaleString('en-IN');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            Fee Ledger & Payment Collection
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manual fee ledger in INR (recorded in paise). All payments produce immutable audit entries.
          </p>
        </div>
      </div>

      {/* Batch Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Filter Batch Ledger:</span>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
        >
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      {loadingStatuses ? (
        <LoadingSpinner text="Computing batch balances and overdue metrics..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Total Agreed Fee</th>
                  <th className="py-3.5 px-4">Total Paid</th>
                  <th className="py-3.5 px-4">Balance</th>
                  <th className="py-3.5 px-4">Overdue Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statuses.map((st) => (
                  <tr key={st.studentId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-850">
                      <div>
                        <span>{st.name}</span>
                        <span className="text-[10px] text-slate-400 block">{st.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{st.phone || '—'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      ₹{toINR(st.totalAgreedFee)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-teal-700">
                      ₹{toINR(st.totalPaid)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      ₹{toINR(st.balance)}
                    </td>
                    <td className="py-3.5 px-4">
                      {st.overdueAmount > 0 ? (
                        <span className="font-extrabold text-rose-600">₹{toINR(st.overdueAmount)}</span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {st.status === 'paid' && <Badge variant="success">Paid in Full</Badge>}
                      {st.status === 'partial' && <Badge variant="teal">Partial / Active</Badge>}
                      {st.status === 'overdue' && <Badge variant="danger">Overdue</Badge>}
                      {st.status === 'pending' && <Badge variant="warning">Pending Initial</Badge>}
                      {st.status === 'not_set' && <Badge variant="default">Unset</Badge>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenRecordPayment(st)}
                        className="px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1 inline-flex"
                      >
                        <Plus className="w-3.5 h-3.5 text-teal-400" />
                        <span>Record Payment</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Record Payment for ${selectedStudentForPay?.name}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <p>
              Candidate: <strong>{selectedStudentForPay?.name}</strong> ({selectedStudentForPay?.email})
            </p>
            <p>
              Current Outstanding Balance:{' '}
              <strong className="text-teal-700">₹{toINR(selectedStudentForPay?.balance)}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Amount in INR (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              value={paymentForm.amountINR}
              onChange={(e) => setPaymentForm({ ...paymentForm, amountINR: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Saved automatically as {Math.round(Number(paymentForm.amountINR || 0) * 100)} integer paise.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentForm.method}
                onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Cash">Cash Receipt</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Transaction / Receipt Reference
            </label>
            <input
              type="text"
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              placeholder="e.g. UPI/2026/099124 or HDFC-NEFT-8812"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Internal Cashier Note</label>
            <input
              type="text"
              value={paymentForm.note}
              onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
              placeholder="e.g. Installment 1 full settlement"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={recording}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {recording ? 'Recording Transaction...' : 'Post Verified Payment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
