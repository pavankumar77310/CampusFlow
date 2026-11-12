import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Calendar,
  Building2,
  Megaphone,
  Users,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

export const FacultyDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFacultyStats = async () => {
    try {
      setLoading(true);
      const data = await api.get('/stats/faculty');
      setStats(data);
    } catch (err) {
      console.error('Failed to load faculty metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyStats();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-500">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading faculty workspace...
      </div>
    );
  }

  const m = stats?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Faculty Profile Hero */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center font-bold text-2xl text-indigo-300 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-1">
                <Award className="w-3.5 h-3.5 text-indigo-300" />
                Faculty Coordinator Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.name}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/80 mt-0.5">
                Department of {user?.department} • ID: {user?.idNumber}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs shadow-md hover:bg-indigo-50 transition"
            >
              <Plus className="w-4 h-4 text-indigo-600" /> Host Event
            </Link>
            <Link
              to="/announcements"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-bold text-xs border border-indigo-400/30 transition"
            >
              <Megaphone className="w-4 h-4" /> Circular
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Organized Events"
          value={m.myOrganizedEventsCount || 0}
          subtitle="Workshops & Conferences"
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          title="Department Students"
          value={m.deptStudentsCount || 0}
          subtitle="Enrolled under department"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Facility Reservations"
          value={m.myBookingsCount || 0}
          subtitle="Labs & Halls reserved"
          icon={Building2}
          color="emerald"
        />
        <StatCard
          title="Active Bulletins"
          value={m.deptAnnouncementsCount || 0}
          subtitle="Department Circulars"
          icon={Megaphone}
          color="amber"
        />
      </div>

      {/* Grid: Events Organized by this Faculty & Booking Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Hosted by Faculty */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">My Organized Events</h3>
                <p className="text-xs text-slate-500">Conferences and workshops managed by you</p>
              </div>
              <Link
                to="/events"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Manage All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(!stats?.myEvents || stats.myEvents.length === 0) ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                You have not created any events yet.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.myEvents.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{ev.title}</p>
                        <Badge value={ev.category} size="xs" />
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>📅 {ev.date}</span>
                        <span>•</span>
                        <span>📍 {ev.venue}</span>
                      </p>
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                        {ev.registeredCount} / {ev.maxCapacity} Registered
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Faculty's Facility Bookings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">My Facility Bookings</h3>
                <p className="text-xs text-slate-500">Labs and seminar halls reserved for instruction</p>
              </div>
              <Link
                to="/resources"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Reserve More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(!stats?.myBookings || stats.myBookings.length === 0) ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No facility reservations submitted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.myBookings.map((b) => (
                  <div
                    key={b._id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {b.resource?.name || 'Campus Facility'}
                        </p>
                        <Badge value={b.status} size="xs" />
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>📅 {b.bookingDate}</span>
                        <span>•</span>
                        <span>⏰ {b.startTime} - {b.endTime}</span>
                      </p>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        {b.purpose}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
