import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Layers, Users, Calendar, ArrowRight } from 'lucide-react';

export const TeacherBatchesPage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/batches');
        if (res.data.success) {
          setBatches(res.data.batches);
        }
      } catch (err) {
        console.error('Failed to load batches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching assigned batches..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
          Assigned Classroom Batches
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Faculty access is restricted to assigned batches in accordance with academy security policy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {batches.map((batch) => (
          <div
            key={batch._id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between card-hover"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-800">
                  {batch.code}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Active Batch
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-850 mb-1">{batch.name}</h3>
              <p className="text-xs text-slate-500 mb-5">{batch.course?.name}</p>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-5">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Enrolled Students</span>
                  <span className="font-extrabold text-slate-850 text-sm">{batch.studentCount || 0} Students</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Test Days</span>
                  <span className="font-semibold text-teal-700">
                    {batch.scheduleDays?.join(' & ') || 'Tuesday & Saturday'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Term: {new Date(batch.startDate).toLocaleDateString()} - {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'Active'}
              </span>
              <Link
                to={`/teacher/students?batch=${batch._id}`}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1"
              >
                <span>View Students</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
