import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ShieldCheck, UserCheck, Mail, Phone, Calendar, Shield, RefreshCw, Crown, AlertCircle } from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load registered users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: res.data.role } : u));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers  = users.length;
  const adminUsers  = users.filter(u => u.role === 'admin').length;
  const custUsers   = users.filter(u => u.role === 'user' || !u.role).length;
  const staffUsers  = users.filter(u => u.role === 'logistics').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-[#4A0000] via-[#6B0000] to-[#800000] border border-[#C9A227]/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2">
            <ShieldCheck size={14} /> Registered Accounts Suite
          </span>
          <h1 className="text-3xl font-black font-serif text-white flex items-center gap-3">
            Registered Customers &amp; Users
          </h1>
          <p className="text-slate-200 text-xs md:text-sm mt-1">
            Manage registered customer profiles, access permissions, and staff roles.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#D4AF37] text-[#4A0000] px-5 py-2.5 rounded-2xl font-black text-xs transition-all shadow-md self-start sm:self-center"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#2E0000] border border-[#C9A227]/40 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Total Registered</span>
            <Users size={20} className="text-[#C9A227]" />
          </div>
          <p className="text-3xl font-black font-serif text-white">{totalUsers}</p>
          <p className="text-[11px] text-[#C9A227] mt-1">All database users</p>
        </div>

        <div className="bg-[#2E0000] border border-[#C9A227]/40 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Customers</span>
            <UserCheck size={20} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-black font-serif text-emerald-400">{custUsers}</p>
          <p className="text-[11px] text-slate-300 mt-1">Shopping accounts</p>
        </div>

        <div className="bg-[#2E0000] border border-[#C9A227]/40 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Admins</span>
            <Crown size={20} className="text-[#C9A227]" />
          </div>
          <p className="text-3xl font-black font-serif text-[#C9A227]">{adminUsers}</p>
          <p className="text-[11px] text-slate-300 mt-1">Full control access</p>
        </div>

        <div className="bg-[#2E0000] border border-[#C9A227]/40 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Logistics Staff</span>
            <Shield size={20} className="text-cyan-400" />
          </div>
          <p className="text-3xl font-black font-serif text-cyan-400">{staffUsers}</p>
          <p className="text-[11px] text-slate-300 mt-1">Fulfillment managers</p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-[#4A0000]/60 border border-[#C9A227]/40 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1F0000] border border-[#C9A227]/40 rounded-2xl text-xs text-white placeholder-slate-400 outline-none focus:border-[#C9A227]"
            />
          </div>

          {/* Role Filter tabs */}
          <div className="flex items-center gap-2 bg-[#1F0000] border border-[#C9A227]/40 p-1.5 rounded-2xl self-start sm:self-center">
            {['all', 'user', 'logistics', 'admin'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  roleFilter === r
                    ? 'bg-[#C9A227] text-[#4A0000] shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Roles' : r}
              </button>
            ))}
          </div>

        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600/60 text-rose-200 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#C9A227]/30 bg-[#2E0000]/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1F0000] text-[#C9A227] font-bold uppercase text-[10px] tracking-wider border-b border-[#C9A227]/30">
              <tr>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4">Account Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A227]/20 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                    <div className="inline-block w-8 h-8 border-3 border-[#C9A227] border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading registered users database...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                    No registered users match your search filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">#{u.id}</td>
                      <td className="px-6 py-4 font-extrabold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#800000] text-amber-300 font-black flex items-center justify-center text-xs border border-[#C9A227]/50">
                          {(u.username || 'U')[0].toUpperCase()}
                        </div>
                        <span>{u.username}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Mail size={13} className="text-[#C9A227]" /> {u.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {u.phone ? (
                          <span className="flex items-center gap-1.5">
                            <Phone size={13} className="text-emerald-400" /> {u.phone}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Earlier'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isSelf ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#C9A227]/20 border border-[#C9A227] text-[#C9A227]">
                            <Crown size={12} /> Admin (You)
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            disabled={updatingId === u.id}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            className="bg-[#1F0000] border border-[#C9A227]/50 text-white rounded-xl px-3 py-1 text-xs font-bold outline-none cursor-pointer focus:border-[#C9A227]"
                          >
                            <option value="user">Customer (user)</option>
                            <option value="logistics">Staff (logistics)</option>
                            <option value="admin">Administrator (admin)</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default AdminUsers;
