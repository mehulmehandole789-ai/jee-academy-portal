import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Users, Search, Edit2, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export const AdminUsersPage = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Edit user modal
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    isActive: true,
    activeBatch: '',
    role: 'student',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, batchesRes] = await Promise.all([
        apiClient.get('/auth/users'),
        apiClient.get('/batches'),
      ]);

      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
      if (batchesRes.data.success) {
        setBatches(batchesRes.data.batches);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      phone: user.phone || '',
      isActive: user.isActive,
      activeBatch: user.activeBatch?._id || '',
      role: user.role,
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.put(`/auth/users/${editUser._id}`, editForm);
      if (res.data.success) {
        success('User record updated.');
        setEditUser(null);
        fetchData();
      }
    } catch (err) {
      error(err.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight">
            User Accounts & Permissions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage students, faculty teachers, and administrator privileges. Accounts with history are deactivated rather than hard-deleted.
          </p>
        </div>

        {/* Role Filters */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl text-xs font-bold self-start">
          {['all', 'student', 'teacher', 'admin'].map((tab) => (
            <button
              key={tab}
              onClick={() => setRoleFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${
                roleFilter === tab ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              {tab}s
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 hidden sm:block">
          Showing {filtered.length} of {users.length} accounts
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching accounts..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Assigned Cohort</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-850">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span>{u.name}</span>
                          <span className="text-[10px] text-slate-400 block">{u.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-bold text-slate-700">{u.role}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === 'student' ? (
                        u.activeBatch ? (
                          <span className="font-semibold text-slate-800">{u.activeBatch.name}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )
                      ) : u.role === 'teacher' ? (
                        <span>{u.assignedBatches?.map((b) => b.name).join(', ') || 'No batches'}</span>
                      ) : (
                        <span className="text-slate-400">Academy-wide</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Deactivated</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
                        title="Edit Account"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title={`Edit User: ${editUser?.name}`}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          {editUser?.role === 'student' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Allocated Active Batch
              </label>
              <select
                value={editForm.activeBatch}
                onChange={(e) => setEditForm({ ...editForm, activeBatch: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="">Unassigned</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded border-slate-300"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-slate-700">
              Account Active (Uncheck to deactivate/archive without deleting test history)
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save User Changes'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
