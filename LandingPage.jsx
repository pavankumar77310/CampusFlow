import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Bell,
  Clock,
  Laptop,
  GraduationCap,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'faculty') return '/dashboard/faculty';
    return '/dashboard/student';
  };

  const features = [
    {
      icon: Building2,
      title: 'Intelligent Resource Reservation',
      description:
        'Auditoriums, IoT laboratories, smart classrooms, and AV projection kits with automatic overlap conflict detection.',
      color: 'from-blue-600 to-cyan-500',
    },
    {
      icon: Calendar,
      title: 'Campus Events & Workshops',
      description:
        'Discover, publish, and register for technical symposiums, hackathons, and cultural fests with real-time seat tracking.',
      color: 'from-indigo-600 to-purple-500',
    },
    {
      icon: Bell,
      title: 'Targeted University Bulletins',
      description:
        'Instant distribution of critical academic schedules, exam timetables, and department circulars with priority tags.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access Control',
      description:
        'Tailored experiences for University Administrators, Faculty Coordinators, and Students with JWT authentication.',
      color: 'from-emerald-600 to-teal-500',
    },
  ];

  const highlights = [
    { count: '100%', label: 'Conflict-Free Resource Allocation' },
    { count: '3 Roles', label: 'Student, Faculty & Admin Workspaces' },
    { count: 'Real-Time', label: 'Dynamic Analytics & MongoDB Storage' },
    { count: 'Zero Overbooking', label: 'Atomic Event Capacity Guards' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                  CampusFlow
                </span>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  v1.0 ERP
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Intelligent Campus Coordination System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition"
                >
                  Register Now
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Generation University ERP & Resource Optimization
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Centralized Campus Operations.{' '}
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                Simplified.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              Empowering students, faculty members, and university administrators with unified
              facility reservations, academic event management, transparent bulletin boards, and
              real-time analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={user ? getDashboardPath() : '/register'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/25 transition"
              >
                Launch Campus Workspace <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition"
              >
                Explore Upcoming Events
              </Link>
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center"
              >
                <div className="text-2xl font-black text-blue-700 mb-1">{h.count}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {h.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Platform Overview & Pillars */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              Integrated Architectural Modules
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for Academic Rigor and Scale
            </h3>
            <p className="text-slate-600 text-sm mt-3">
              Eliminate manual paperwork, double-booked auditoriums, and missed notices with
              intelligent automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white shadow-md mb-5 group-hover:scale-105 transition`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition">
                      {f.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {f.description}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                    Learn more <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-Based Overview Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              Stakeholder Experience
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              One Unified System, 3 Specialized Experiences
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">For Students</h4>
              <p className="text-xs text-slate-600 mb-6">
                Personalized dashboard with fast event registrations, instant facility booking
                requests, and real-time updates on academic circulars.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> One-click event registration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Lab & classroom reservations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live booking status tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Departmental notifications
                </li>
              </ul>
              <Link
                to="/register"
                className="mt-6 w-full py-2.5 text-center text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
              >
                Join as Student
              </Link>
            </div>

            {/* Faculty Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">For Faculty Members</h4>
              <p className="text-xs text-slate-600 mb-6">
                Organize departmental symposiums, publish student announcements, reserve seminar
                halls, and inspect attendee rosters.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Host workshops & conferences
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Broadcast urgent circulars
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Priority lab & hall booking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Export attendee lists
                </li>
              </ul>
              <Link
                to="/register"
                className="mt-6 w-full py-2.5 text-center text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
              >
                Faculty Access
              </Link>
            </div>

            {/* Admin Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">For Campus Administrators</h4>
              <p className="text-xs text-slate-600 mb-6">
                Complete operational authority over campus facilities, user directory, booking
                approvals, and aggregate utilization reports.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" /> Approve / reject bookings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" /> Add & manage resources
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" /> Graphical analytics & trends
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" /> User lifecycle management
                </li>
              </ul>
              <Link
                to="/login"
                className="mt-6 w-full py-2.5 text-center text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition"
              >
                Administrative Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 text-white font-extrabold text-xl mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                CampusFlow
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
                An Intelligent Campus Coordination and Resource Management System designed for
                B.Tech Computer Science and Engineering Software Engineering academic project
                demonstration.
              </p>
              <div className="text-[11px] text-slate-500">
                Built with React, Node.js, Express, MongoDB Atlas, and Tailwind CSS.
              </div>
            </div>

            <div>
              <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
                Quick Navigation
              </h5>
              <ul className="space-y-2 text-xs">
                <li><Link to="/events" className="hover:text-white transition">Campus Events</Link></li>
                <li><Link to="/resources" className="hover:text-white transition">Facilities & Equipment</Link></li>
                <li><Link to="/announcements" className="hover:text-white transition">University Circulars</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
                Academic Project Info
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                Department of Computer Science & Engineering
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Software Engineering & System Design Laboratory
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <div>&copy; 2026 CampusFlow. All academic rights reserved.</div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span>B.Tech CSE Project</span>
              <span>•</span>
              <span>Responsive Web Application</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
