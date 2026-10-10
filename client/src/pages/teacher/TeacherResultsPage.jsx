import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import {
  Award,
  Search,
  Download,
  ArrowLeft,
  Users,
  ChevronDown,
  ChevronUp,
  UserX,
} from 'lucide-react';

export const TeacherResultsPage = () => {
  const { testId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('batchRank');
  const [order, setOrder] = useState('asc');

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `/results/${testId}/teacher-results?search=${search}&sortBy=${sortBy}&order=${order}`
      );
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load teacher results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [testId, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResults();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const exportCSV = () => {
    if (!data?.results) return;

    const headers = ['Rank', 'Student Name', 'Email', 'Score', 'Max Score', 'Percentage', 'Accuracy', 'Physics', 'Chemistry', 'Mathematics', 'Status'];
    const rows = data.results.map((r) => [
      r.batchRank || '—',
      `"${r.name}"`,
      r.email,
      r.score,
      r.maxScore,
      `${r.percentage}%`,
      `${r.accuracy}%`,
      r.subjectScores?.Physics || 0,
      r.subjectScores?.Chemistry || 0,
      r.subjectScores?.Mathematics || 0,
      r.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${data.test?.title || 'test'}_results_roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return <LoadingSpinner text="Compiling test roster results..." />;
  }

  const { test, results = [], absent = [], totalEnrolled, totalAttended } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/teacher/tests"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-navy-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-850 tracking-tight">
              {test?.title || 'Test Evaluation Roster'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Batch: {test?.batch?.name} • Total Marks: {test?.totalMarks} pts
            </p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 self-start"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Export Roster CSV</span>
        </button>
      </div>

      {/* Cohort KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Enrolled</span>
          <span className="text-xl font-extrabold text-slate-850">{totalEnrolled}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Evaluated Attempts</span>
          <span className="text-xl font-extrabold text-teal-700">{totalAttended}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Absent Students</span>
          <span className="text-xl font-extrabold text-rose-600">{absent.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Attendance Rate</span>
          <span className="text-xl font-extrabold text-navy-800">
            {totalEnrolled > 0 ? Math.round((totalAttended / totalEnrolled) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="text-xs text-slate-400 font-medium">
          Competition Ranking (1, 2, 2, 4): Equal scores share ranks.
        </div>
      </div>

      {/* Evaluated Student Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-850">Evaluated Candidates</h3>
          <span className="text-xs text-slate-400">{results.length} Scored Submissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase text-[10px] font-bold select-none">
                <th
                  onClick={() => handleSort('batchRank')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-700"
                >
                  <div className="flex items-center space-x-1">
                    <span>Rank</span>
                    {sortBy === 'batchRank' && (order === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-700"
                >
                  <div className="flex items-center space-x-1">
                    <span>Student</span>
                    {sortBy === 'name' && (order === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('score')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-700"
                >
                  <div className="flex items-center space-x-1">
                    <span>Score</span>
                    {sortBy === 'score' && (order === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('percentage')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-700"
                >
                  <div className="flex items-center space-x-1">
                    <span>%</span>
                    {sortBy === 'percentage' && (order === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Subject Scores (P / C / M)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-850">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-100 text-slate-800 text-xs">
                      #{r.batchRank || '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-850">{r.name}</p>
                    <p className="text-[11px] text-slate-400">{r.email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-teal-700">
                    {r.score} / {r.maxScore}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{r.percentage}%</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.accuracy}%</td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {r.subjectScores?.Physics || 0} / {r.subjectScores?.Chemistry || 0} / {r.subjectScores?.Mathematics || 0}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge variant="success">Finalized</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Absent Students Section (Separated) */}
      {absent.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 text-rose-700">
            <UserX className="w-5 h-5" />
            <h3 className="text-sm font-bold">Absent Enrolled Students ({absent.length})</h3>
          </div>
          <p className="text-xs text-slate-500">
            These candidates did not submit an attempt during the scheduled test duration and are displayed separately without an assigned competition rank.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {absent.map((a, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{a.name}</p>
                  <p className="text-[10px] text-slate-400">{a.email}</p>
                </div>
                <Badge variant="danger">Absent</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
