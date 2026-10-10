import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  ExternalLink,
  FileText,
  Video,
  Layers,
} from 'lucide-react';

export const StudentMaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/materials');
      if (res.data.success) {
        setMaterials(res.data.materials);
      }
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const filteredMaterials = materials.filter((m) => {
    if (subjectFilter !== 'all' && m.subject !== subjectFilter) return false;
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.chapter.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getTypeIcon = (type) => {
    if (type === 'video_link') return <Video className="w-5 h-5 text-purple-600" />;
    return <FileText className="w-5 h-5 text-teal-600" />;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
          Batch Study Materials & Practice Problem Sets
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Authorized notes, DPP practice sheets, assignments, and faculty masterclasses scoped to your batch.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, chapter or topic..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="all">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Mixed PCM">Mixed PCM</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="all">All Material Types</option>
            <option value="notes">Class Notes</option>
            <option value="practice_sheet">Practice Sheets (DPP)</option>
            <option value="assignment">Assignments</option>
            <option value="video_link">Video Masterclass</option>
          </select>
        </div>
      </div>

      {/* Material Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching batch materials..." />
      ) : filteredMaterials.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Study Materials Found"
          description="There are currently no uploaded materials matching your search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => (
            <div
              key={mat._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between card-hover"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy-100 text-navy-800">
                    {mat.subject}
                  </span>
                  <Badge variant={mat.type === 'video_link' ? 'purple' : 'teal'}>
                    {mat.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-start space-x-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                    {getTypeIcon(mat.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-850 leading-snug line-clamp-2">
                      {mat.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-teal-700 mt-0.5">
                      Chapter: {mat.chapter}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                  {mat.description || 'Classroom practice resource.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {new Date(mat.createdAt).toLocaleDateString()}
                </span>

                {mat.storedFileName ? (
                  <a
                    href={`/api/materials/${mat._id}/download`}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>
                ) : mat.externalUrl ? (
                  <a
                    href={mat.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Lecture</span>
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
