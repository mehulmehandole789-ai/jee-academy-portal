import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import {
  Bell,
  Search,
  ExternalLink,
  Calendar,
  CheckCircle,
  Pin,
  ShieldCheck,
} from 'lucide-react';

export const StudentAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.post(`/announcements/${id}/read`);
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const filtered = announcements.filter((a) => {
    if (category !== 'all' && a.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.issuingOrganization.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
          Academy & Examination Announcements
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Official notifications from NTA, IIT JEE Advanced, CBSE, and JEE Academy Administration.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              category === 'all' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            All Notices
          </button>
          <button
            onClick={() => setCategory('examination')}
            className={`px-3 py-1.5 rounded-lg transition ${
              category === 'examination' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Examination Bulletins
          </button>
          <button
            onClick={() => setCategory('academy')}
            className={`px-3 py-1.5 rounded-lg transition ${
              category === 'academy' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Academy Notices
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bulletins..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <LoadingSpinner text="Retrieving announcements..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notices Available"
          description="There are currently no announcements matching your category."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all flex flex-col justify-between ${
                item.isPinned
                  ? 'border-teal-300 ring-2 ring-teal-500/10 shadow-sm'
                  : 'border-slate-200 shadow-xs'
              } ${item.isRead ? 'opacity-85' : ''}`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-800">
                      {item.issuingOrganization}
                    </span>
                    <Badge variant={item.category === 'examination' ? 'purple' : 'teal'}>
                      {item.category === 'examination' ? 'Exam Bulletin' : 'Academy Notice'}
                    </Badge>
                    {item.isPinned && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Pin className="w-3 h-3" />
                        <span>Pinned</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Published: {new Date(item.publicationDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-850 mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 whitespace-pre-line">
                  {item.description}
                </p>

                {item.deadline && (
                  <div className="inline-flex items-center space-x-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-4">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Important Deadline: <strong>{new Date(item.deadline).toLocaleDateString()}</strong></span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {item.officialSourceUrl ? (
                    <a
                      href={item.officialSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
                    >
                      <span>Official Source Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Issued by Academy Faculty Desk</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {!item.isRead ? (
                    <button
                      onClick={() => handleMarkAsRead(item._id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    >
                      Mark as Read
                    </button>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs text-emerald-600 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Read</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
