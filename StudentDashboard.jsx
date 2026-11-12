import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Building2,
  Bell,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  PlusCircle,
  AlertCircle,
  Sparkles,
  MapPin,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import ConfirmationDialog from '../components/ConfirmationDialog';

export const StudentDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel booking modal
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    bookingId: null,
    loading: false,
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.get('/stats/student');
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelModal.bookingId) return;
    try {
      setCancelModal((prev) => ({ ...prev, loading: true }));
      await api.delete(`/bookings/${cancelModal.bookingId}`);
      setCancelModal({ isOpen: false, bookingId: null, loading: false });
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
      setCancelModal((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500">Loading student workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Student Portal & Academic Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-xl">
              {user?.department} • Roll No: {user?.idNumber} • {user?.yearOfStudy}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs shadow-md hover:bg-blue-50 transition"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" /> Book Facility
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700/80 hover:bg-blue-700 text-white font-bold text-xs border border-blue-400/30 transition"
            >
              <Calendar className="w-4 h-4" /> Browse Events
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Registered Events"
          value={stats?.metrics?.myRegistrationsCount || 0}
          subtitle="Events you are attending"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Resource Bookings"
          value={stats?.metrics?.myBookingsCount || 0}
          subtitle="Classrooms & labs reserved"
          icon={Building2}
          color="emerald"
        />
        <StatCard
          title="Pending Notifications"
          value={stats?.metrics?.unreadNotificationsCount || 0}
          subtitle="Unread campus updates"
          icon={Bell}
          color="amber"
        />
      </div>

      {/* Main Grid: My Bookings & Registered Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section: My Resource Bookings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">My Resource Bookings</h3>
                <p className="text-xs text-slate-500">Track and manage facility requests</p>
              </div>
              <Link
                to="/resources"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Reserve More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(!stats?.recentBookings || stats.recentBookings.length === 0) ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No facility reservations made yet.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentBookings.map((b) => (
                  <div
                    key={b._id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {b.resource?.name || 'Campus Resource'}
                        </p>
                        <Badge value={b.status} size="xs" />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                        <span>📅 {b.bookingDate}</span>
                        <span>•</span>
                        <span>⏰ {b.startTime} - {b.endTime}</span>
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1 truncate">
                        Purpose: {b.purpose}
                      </p>
                    </div>

                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() =>
                          setCancelModal({ isOpen: true, bookingId: b._id, loading: false })
                        }
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section: My Registered Events */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">My Registered Events</h3>
                <p className="text-xs text-slate-500">Conferences and workshops confirmed</p>
              </div>
              <Link
                to="/events"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                All Events <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(!stats?.recentRegistrations || stats.recentRegistrations.length === 0) ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                You have not registered for any events yet.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentRegistrations.map((reg) => {
                  const ev = reg.event;
                  if (!ev) return null;
                  return (
                    <div
                      key={reg._id}
                      className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{ev.title}</p>
                          <Badge value={ev.category} size="xs" />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                          <span>📅 {ev.date}</span>
                          <span>•</span>
                          <span>📍 {ev.venue}</span>
                        </p>
                      </div>

                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap">
                        Confirmed
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Latest Announcements Bulletin */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                Latest University Circulars
              </h3>
              <p className="text-xs text-slate-500">Official academic announcements and alerts</p>
            </div>
          </div>
          <Link
            to="/announcements"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Bulletin Board <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats?.recentAnnouncements?.map((a) => (
            <div
              key={a._id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge value={a.priority} size="xs" />
                  <span className="text-[10px] text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1.5 line-clamp-2">
                  {a.title}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                  {a.content}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/50 text-[10px] text-slate-400 flex items-center justify-between">
                <span>By: {a.author?.name || 'Administration'}</span>
                <span className="text-blue-600 font-semibold">{a.department}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmationDialog
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, bookingId: null, loading: false })}
        onConfirm={handleCancelBooking}
        loading={cancelModal.loading}
        title="Cancel Booking Request?"
        message="Are you sure you wish to cancel this facility reservation? Your reserved slot will immediately become available for other campus members."
        confirmText="Yes, Cancel Booking"
        type="danger"
      />
    </div>
  );
};

export default StudentDashboard;
