import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Receipt,
  FileText,
} from 'lucide-react';

export const StudentFeesPage = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/fees/my');
        if (res.data.success) {
          setFeeData(res.data);
        }
      } catch (err) {
        console.error('Failed to load fee details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading official fee ledger..." />;
  }

  if (!feeData || !feeData.hasAccount) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-xl mx-auto space-y-4">
        <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">No Fee Schedule Configured</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your fee account and installment schedule will be configured by administration following batch allocation. Please check back shortly.
        </p>
      </div>
    );
  }

  const { feeAccount, totalAgreedFee, totalPaid, balance, overdueAmount, status, nextInstallment, payments } = feeData;

  const toINR = (paise) => Math.round((paise || 0) / 100).toLocaleString('en-IN');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
          Fee Accounts & Payment Ledger
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Official manual fee recording ledger and installment schedule in INR.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Total Agreed Fee
          </span>
          <span className="text-2xl font-extrabold text-slate-850">₹{toINR(totalAgreedFee)}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Course program agreed fee</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Total Paid to Date
          </span>
          <span className="text-2xl font-extrabold text-teal-700">₹{toINR(totalPaid)}</span>
          <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">
            Verified by Administration
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Outstanding Balance
          </span>
          <span className="text-2xl font-extrabold text-slate-800">₹{toINR(balance)}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Remaining overall fee</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Current Overdue
          </span>
          <span className={`text-2xl font-extrabold ${overdueAmount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            ₹{toINR(overdueAmount)}
          </span>
          <span className={`text-[11px] font-semibold block mt-1 ${overdueAmount > 0 ? 'text-rose-600' : 'text-teal-600'}`}>
            {overdueAmount > 0 ? 'Past installment due date' : 'Installments up to date'}
          </span>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-slate-800">Academy Fee Policy Notice</p>
          <p>
            Payments are manually recorded by the academy cashier desk via UPI, Bank Transfer (NEFT/IMPS), Cash, or Cheque. No online gateway is integrated in this portal; receipts are posted directly by administration.
          </p>
        </div>
      </div>

      {/* Installment Schedule Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-850">Scheduled Installment Plan</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Installment Title</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feeAccount.installments?.map((inst) => {
                const isPast = new Date(inst.dueDate) < new Date();
                return (
                  <tr key={inst.installmentNumber} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 font-bold text-slate-800">{inst.installmentNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{inst.title}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {new Date(inst.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-teal-700">₹{toINR(inst.amount)}</td>
                    <td className="py-3 px-3">
                      {balance === 0 ? (
                        <Badge variant="success">Paid in Full</Badge>
                      ) : isPast ? (
                        overdueAmount > 0 ? (
                          <Badge variant="danger">Overdue</Badge>
                        ) : (
                          <Badge variant="success">Satisfied</Badge>
                        )
                      ) : (
                        <Badge variant="default">Upcoming</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipts History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-850">Recorded Payment History</h3>
        {payments && payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3">Transaction Reference</th>
                  <th className="py-3 px-3">Cashier Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 text-slate-600">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-teal-700">
                      ₹{toINR(p.amount)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{p.method}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {p.reference || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{p.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            No payments have been recorded yet.
          </p>
        )}
      </div>
    </div>
  );
};
