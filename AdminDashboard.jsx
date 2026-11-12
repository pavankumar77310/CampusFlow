import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  ShieldCheck,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  ArrowRight,
  Database,
  UserCheck,
  Plus,
  Megaphone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'bookings' | 'events' | 'resources'

  // Users Management State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userLoading, setUserLoading] = useState(false);

  // Resources & Events State
  const [allResources, setAllResources] = useState([]);
  const [allEvents, setAllEvents] = useState([]);

  // User Delete Modal
  const [deleteUserModal, setDeleteUserModal] = useState({
    isOpen: false,
    user: null,
    loading: false,
  });

  // Booking Review Quick Modal
  const [reviewBookingModal, setReviewBookingModal] = useState({
    isOpen: false,
    bookingId: null,
    status: 'approved',
    remarks: '',
    loading: false,
  });

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const data = await api.get('/stats/admin');
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (userSearch) params.search = userSearch;
      const data = await api.get('/users', { params });
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchResourcesAndEvents = async () => {
    try {
      const [resData, evData] = await Promise.all([
        api.get('/resources'),
        api.get('/events'),
      ]);
      setAllResources(resData.resources || []);
      setAllEvents(evData.events || []);
    } catch (err) {
      console.error('Failed to load resources/events:', err);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchUsers();
    fetchResourcesAndEvents();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, userSearch]);

  const handleDeleteUser = async () => {
    if (!deleteUserModal.user) return;
    try {
      setDeleteUserModal((p) => ({ ...p, loading: true }));
      await api.delete(`/users/${deleteUserModal.user._id}`);
      setDeleteUserModal({ isOpen: false, user: null, loading: false });
      fetchUsers();
      fetchAdminStats();
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
      setDeleteUserModal((p) => ({ ...p, loading: false }));
    }
  };

  const handleReviewBooking = async (e) => {
    e.preventDefault();
    try {
      setReviewBookingModal((p) => ({ ...p, loading: true }));
      await api.put(`/bookings/${reviewBookingModal.bookingId}/status`, {
        status: reviewBookingModal.status,
        adminRemarks: reviewBookingModal.remarks,
      });
      setReviewBookingModal({ isOpen: false, bookingId: null, status: 'approved', remarks: '', loading: false });
      fetchAdminStats();
    } catch (err) {
      alert(err.message || 'Status update failed.');
      setReviewBookingModal((p) => ({ ...p, loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-500">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Aggregating system analytics...
      </div>
    );
  }

  const m = stats?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Administrative Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              University Operations & Resource Allocation
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-xl">
              Complete oversight of facility bookings, campus events, user directory, and resource schedules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/resources"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" /> Add Facility
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              <Calendar className="w-4 h-4" /> Create Event
            </Link>
            <Link
              to="/announcements"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
            >
              <Megaphone className="w-4 h-4" /> Circular
            </Link>
          </div>
        </div>

        {/* MongoDB Sync Info Pill */}
        <div className="mt-6 pt-4 border-t border-purple-800/40 flex flex-wrap items-center justify-between gap-3 text-xs text-purple-200/70">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>MongoDB Database:</span>
            <code className="bg-purple-900/60 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
              campusflow
            </code>
            <span>(Port 27017)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Database Synchronized
          </div>
        </div>
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Students"
          value={m.totalStudents || 0}
          subtitle="Enrolled"
          icon={Users}
          color="blue"
          onClick={() => { setActiveTab('users'); setRoleFilter('student'); }}
        />
        <StatCard
          title="Faculty"
          value={m.totalFaculty || 0}
          subtitle="Academic Staff"
          icon={ShieldCheck}
          color="indigo"
          onClick={() => { setActiveTab('users'); setRoleFilter('faculty'); }}
        />
        <StatCard
          title="Events"
          value={m.totalEvents || 0}
          subtitle="Active / Total"
          icon={Calendar}
          color="purple"
          onClick={() => setActiveTab('events')}
        />
        <StatCard
          title="Resources"
          value={m.totalResources || 0}
          subtitle="Facilities"
          icon={Building2}
          color="emerald"
          onClick={() => setActiveTab('resources')}
        />
        <StatCard
          title="Pending"
          value={m.pendingBookings || 0}
          subtitle="Needs Review"
          icon={Clock}
          color="amber"
          onClick={() => setActiveTab('bookings')}
        />
        <StatCard
          title="Approved"
          value={m.approvedBookings || 0}
          subtitle="Confirmed"
          icon={CheckCircle}
          color="emerald"
          onClick={() => setActiveTab('bookings')}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Visual Analytics & Trends
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'bookings'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Booking Approvals Queue ({m.pendingBookings || 0})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'events'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Campus Events ({allEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'resources'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Facility Inventory ({allResources.length})
        </button>
      </div>

      {/* TAB 1: VISUAL ANALYTICS (Recharts) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Department-wise Enrollment */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">
                    Department Student & Faculty Distribution
                  </h3>
                  <p className="text-[11px] text-slate-500">Cross-department member distribution</p>
                </div>
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.charts?.usersByDepartment || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="department"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(d) => d.split(' ')[0]}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="students" name="Students" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="faculty" name="Faculty" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Resource Inventory Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">
                    Campus Facilities by Category
                  </h3>
                  <p className="text-[11px] text-slate-500">Inventory allocation of halls & labs</p>
                </div>
                <PieIcon className="w-5 h-5 text-slate-400" />
              </div>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.charts?.resourcesByCategory || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {(stats?.charts?.resourcesByCategory || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Booking Submissions & Instant Action Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">
                  Recent Facility Booking Applications
                </h3>
                <p className="text-xs text-slate-500">Review pending reservation queues</p>
              </div>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                View Full Queue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Applicant</th>
                    <th className="px-5 py-3">Facility</th>
                    <th className="px-5 py-3">Date & Slot</th>
                    <th className="px-5 py-3">Purpose</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.recentBookings?.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-800">{b.user?.name || 'User'}</div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {b.user?.role} • {b.user?.department}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        {b.resource?.name || 'Resource'}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div>📅 {b.bookingDate}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ⏰ {b.startTime} - {b.endTime}
                        </div>
                      </td>
                      <td className="px-5 py-3 max-w-xs truncate">{b.purpose}</td>
                      <td className="px-5 py-3">
                        <Badge value={b.status} size="xs" />
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() =>
                            setReviewBookingModal({
                              isOpen: true,
                              bookingId: b._id,
                              status: 'approved',
                              remarks: 'Approved by administrator.',
                              loading: false,
                            })
                          }
                          className="px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Search & Role Filter Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name, email, or ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 capitalize"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          {userLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading university users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Full Name & Email</th>
                    <th className="px-5 py-3">ID / Roll No</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Year / Category</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Joined Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden border border-purple-200">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono font-medium text-slate-700">{u.idNumber}</td>
                      <td className="px-5 py-3 text-slate-700">{u.department}</td>
                      <td className="px-5 py-3 text-slate-500">{u.yearOfStudy || 'N/A'}</td>
                      <td className="px-5 py-3">
                        <Badge value={u.role} size="xs" />
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setDeleteUserModal({ isOpen: true, user: u, loading: false })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BOOKINGS APPROVAL QUEUE */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                Facility Booking Requests Queue
              </h3>
              <p className="text-xs text-slate-500">
                Review, approve, or reject reservation applications
              </p>
            </div>
            <Link
              to="/resources"
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs hover:bg-purple-100 transition"
            >
              Open Full Booking Module
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Applicant</th>
                  <th className="px-5 py-3">Facility</th>
                  <th className="px-5 py-3">Booking Slot</th>
                  <th className="px-5 py-3">Purpose</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentBookings?.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-800">{b.user?.name || 'Applicant'}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{b.user?.department}</div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {b.resource?.name || 'Resource'}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div>📅 {b.bookingDate}</div>
                      <div className="text-[10px] text-slate-400 font-mono">⏰ {b.startTime} - {b.endTime}</div>
                    </td>
                    <td className="px-5 py-3 max-w-xs truncate">{b.purpose}</td>
                    <td className="px-5 py-3">
                      <Badge value={b.status} size="xs" />
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            setReviewBookingModal({
                              isOpen: true,
                              bookingId: b._id,
                              status: 'approved',
                              remarks: 'Approved by administrator.',
                              loading: false,
                            })
                          }
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setReviewBookingModal({
                              isOpen: true,
                              bookingId: b._id,
                              status: 'rejected',
                              remarks: 'Slot conflict or maintenance schedule.',
                              loading: false,
                            })
                          }
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CAMPUS EVENTS OVERVIEW */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                All Campus Events & Symposia
              </h3>
              <p className="text-xs text-slate-500">Track registration limits and attendance</p>
            </div>
            <Link
              to="/events"
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs hover:bg-blue-100 transition"
            >
              Manage Events Module
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Event Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Venue</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Registrations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allEvents.map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-bold text-slate-800">{ev.title}</td>
                    <td className="px-5 py-3"><Badge value={ev.category} size="xs" /></td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div>📅 {ev.date}</div>
                      <div className="text-[10px] text-slate-400">⏰ {ev.startTime} - {ev.endTime}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{ev.venue}</td>
                    <td className="px-5 py-3 text-slate-600">{ev.department}</td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {ev.registeredCount} / {ev.maxCapacity} seats
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FACILITY INVENTORY */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                Campus Facilities & Equipment Inventory
              </h3>
              <p className="text-xs text-slate-500">Auditoriums, laboratories, classrooms, and gear</p>
            </div>
            <Link
              to="/resources"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition"
            >
              Add / Edit Facilities
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Facility Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Code / ID</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Capacity</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allResources.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-bold text-slate-800">{res.name}</td>
                    <td className="px-5 py-3"><Badge value={res.category} size="xs" /></td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-600">{res.code}</td>
                    <td className="px-5 py-3 text-slate-600">{res.location}</td>
                    <td className="px-5 py-3 text-slate-800 font-semibold">{res.capacity} attendees</td>
                    <td className="px-5 py-3"><Badge value={res.maintenanceStatus} size="xs" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK BOOKING REVIEW MODAL */}
      <Modal
        isOpen={reviewBookingModal.isOpen}
        onClose={() => setReviewBookingModal((p) => ({ ...p, isOpen: false }))}
        title="Admin Facility Review"
        subtitle="Approve or reject reservation request"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReviewBooking} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Decision Status *
            </label>
            <select
              value={reviewBookingModal.status}
              onChange={(e) => setReviewBookingModal((p) => ({ ...p, status: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
            >
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Feedback Remarks
            </label>
            <textarea
              rows={3}
              value={reviewBookingModal.remarks}
              onChange={(e) =>
                setReviewBookingModal((p) => ({ ...p, remarks: e.target.value }))
              }
              placeholder="Comments forwarded to applicant..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReviewBookingModal((p) => ({ ...p, isOpen: false }))}
              className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewBookingModal.loading}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition"
            >
              {reviewBookingModal.loading ? 'Updating...' : 'Save Decision'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE USER CONFIRMATION */}
      <ConfirmationDialog
        isOpen={deleteUserModal.isOpen}
        onClose={() => setDeleteUserModal({ isOpen: false, user: null, loading: false })}
        onConfirm={handleDeleteUser}
        loading={deleteUserModal.loading}
        title={`Delete User: ${deleteUserModal.user?.name}?`}
        message="Are you sure you want to delete this user? Their account and access to the portal will be permanently removed."
        confirmText="Yes, Delete User"
        type="danger"
      />
    </div>
  );
};

export default AdminDashboard;
