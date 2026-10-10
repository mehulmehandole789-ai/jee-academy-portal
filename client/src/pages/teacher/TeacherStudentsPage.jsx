import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  Search,
  BookOpen,
  TrendingUp,
  FileText,
  Award,
  ArrowRight,
} from 'lucide-react';

export const TeacherStudentsPage = () => {
  const [searchParams] = useSearchParams();
  const initialBatch = searchParams.get('batch') || '';

  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(initialBatch);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Student progress modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [batchRes, usersRes] = await Promise.all([
          apiClient.get('/batches'),
          apiClient.get('/auth/users?role=student'),
        ]);

        if (batchRes.data.success) {
          setBatches(batchRes.data.batches);
        }
        if (usersRes.data.success) {
          setStudents(usersRes.data.users);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenStudentStats = async (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
    setLoadingStats(true);
    try {
      const res = await apiClient.get(`/stats/student/${student._id}`);
      if (res.data.success) {
        setStudentStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load student stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const filteredStudents = students.filter((st) => {
    if (selectedBatch && st.activeBatch?._id !== selectedBatch) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        st.name.toLowerCase().includes(q) ||
        st.email.toLowerCase().includes(q) ||
        (st.phone && st.phone.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
          Batch Student Roster
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          View enrolled students in your assigned batches and inspect individual test performance.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Assigned Batches</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching enrolled students..." />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description="There are no students matching your filter criteria."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Enrolled Batch</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4 text-right">Academic Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-850">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {st.name.charAt(0)}
                        </div>
                        <span>{st.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{st.email}</td>
                    <td className="py-3.5 px-4">
                      {st.activeBatch ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {st.activeBatch.name || 'Batch'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{st.phone || '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenStudentStats(st)}
                        className="px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-[11px] shadow-xs transition inline-flex items-center space-x-1"
                      >
                        <span>View Progress</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Progress Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedStudent ? `${selectedStudent.name} - Academic Progress` : 'Student Progress'}
        maxWidth="max-w-2xl"
      >
        {loadingStats ? (
          <LoadingSpinner text="Fetching student progress history..." />
        ) : studentStats?.hasEnoughData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Average %</span>
                <span className="text-xl font-extrabold text-teal-700">{studentStats.overallAvgPercentage}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Accuracy</span>
                <span className="text-xl font-extrabold text-slate-850">{studentStats.overallAvgAccuracy}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Participation</span>
                <span className="text-xl font-extrabold text-navy-800">{studentStats.participationRate}%</span>
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Subject Averages
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-100">
                  <span className="text-teal-800 font-bold block">Physics</span>
                  <span className="text-lg font-extrabold text-teal-900">
                    {studentStats.subjectBreakdown?.Physics?.averageScore || 0} pts
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                  <span className="text-slate-700 font-bold block">Chemistry</span>
                  <span className="text-lg font-extrabold text-slate-850">
                    {studentStats.subjectBreakdown?.Chemistry?.averageScore || 0} pts
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-amber-800 font-bold block">Mathematics</span>
                  <span className="text-lg font-extrabold text-amber-900">
                    {studentStats.subjectBreakdown?.Mathematics?.averageScore || 0} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Timeline */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Recent Finalized Attempts
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {studentStats.performanceTimeline?.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-white flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{t.title}</p>
                      <p className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-teal-700">{t.percentage}%</p>
                      <p className="text-[10px] text-slate-500">Rank #{t.batchRank || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            Student has not yet completed sufficient tests to generate analytical reports.
          </div>
        )}
      </Modal>
    </div>
  );
};
