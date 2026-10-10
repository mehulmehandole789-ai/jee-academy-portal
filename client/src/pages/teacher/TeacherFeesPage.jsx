import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { CreditCard, ShieldAlert, Layers } from 'lucide-react';

export const TeacherFeesPage = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  useEffect(() => {
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
    fetchBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatch) return;
    const fetchFeeStatuses = async () => {
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
    fetchFeeStatuses();
  }, [selectedBatch]);

  const toINR = (paise) => Math.round((paise || 0) / 100).toLocaleString('en-IN');

  if (loading) {
    return <LoadingSpinner text="Fetching assigned batches..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
          Batch Fee Status (Read-Only)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Faculty overview of student installment standing across assigned batches.
        </p>
      </div>

      {/* Read-Only Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Faculty Access Restriction Policy</p>
          <p>
            Teachers have read-only visibility into student fee compliance to support academic mentoring. Financial payment recording and schedule modifications are restricted to Admin accounts.
          </p>
        </div>
      </div>

      {/* Batch Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Select Batch Roster:</span>
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

      {/* Statuses Table */}
      {loadingStatuses ? (
        <LoadingSpinner text="Compiling fee records for batch..." />
      ) : statuses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 text-xs text-slate-400">
          No students enrolled in this batch.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Total Agreed Fee</th>
                  <th className="py-3.5 px-4">Total Paid</th>
                  <th className="py-3.5 px-4">Outstanding Balance</th>
                  <th className="py-3.5 px-4">Overdue Amount</th>
                  <th className="py-3.5 px-4 text-right">Fee Status</th>
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
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      ₹{toINR(st.totalAgreedFee)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-teal-700">
                      ₹{toINR(st.totalPaid)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      ₹{toINR(st.balance)}
                    </td>
                    <td className="py-3.5 px-4">
                      {st.overdueAmount > 0 ? (
                        <span className="font-extrabold text-rose-600">₹{toINR(st.overdueAmount)}</span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {st.status === 'paid' && <Badge variant="success">Paid in Full</Badge>}
                      {st.status === 'partial' && <Badge variant="teal">Partial / On Track</Badge>}
                      {st.status === 'overdue' && <Badge variant="danger">Overdue</Badge>}
                      {st.status === 'pending' && <Badge variant="warning">Pending Initial</Badge>}
                      {st.status === 'not_set' && <Badge variant="default">Unconfigured</Badge>}
                    </td>
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
