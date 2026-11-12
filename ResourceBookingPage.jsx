import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Layers,
  Wrench,
  Trash2,
  Edit,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';

export const ResourceBookingPage = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'my-bookings' | 'all-bookings'
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Booking Request Modal
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    resource: null,
    loading: false,
    conflictError: null,
    formData: {
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:00',
      purpose: '',
      attendeesCount: 20,
    },
  });

  // Resource Create/Edit Modal (Admin Only)
  const [resourceModal, setResourceModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    resourceId: null,
    loading: false,
    formData: {
      name: '',
      category: 'Seminar Hall',
      code: '',
      location: '',
      capacity: 50,
      features: '',
      isAvailable: true,
      maintenanceStatus: 'Operational',
      description: '',
      imageUrl: '',
    },
  });

  // Booking Review Modal (Admin Approve/Reject)
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    bookingId: null,
    status: 'approved',
    adminRemarks: '',
    loading: false,
  });

  // Delete Resource Modal
  const [deleteResourceModal, setDeleteResourceModal] = useState({
    isOpen: false,
    resourceId: null,
    loading: false,
  });

  const categories = [
    'All',
    'Seminar Hall',
    'Classroom',
    'Laboratory',
    'Auditorium',
    'Sports Facility',
    'Projector',
    'Campus Equipment',
  ];

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search) params.search = search;
      const data = await api.get('/resources', { params });
      setResources(data.resources || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch resources.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = activeTab === 'my-bookings' ? { mine: 'true' } : {};
      const data = await api.get('/bookings', { params });
      setBookings(data.bookings || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch bookings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchResources();
    } else {
      fetchBookings();
    }
  }, [activeTab, selectedCategory, search]);

  const isAdmin = user?.role === 'admin';

  // Handle Resource Booking Submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingModal((p) => ({ ...p, conflictError: null }));

    try {
      setBookingModal((p) => ({ ...p, loading: true }));
      const payload = {
        resource: bookingModal.resource._id,
        bookingDate: bookingModal.formData.bookingDate,
        startTime: bookingModal.formData.startTime,
        endTime: bookingModal.formData.endTime,
        purpose: bookingModal.formData.purpose,
        attendeesCount: Number(bookingModal.formData.attendeesCount),
      };

      const res = await api.post('/bookings', payload);
      setFeedback({ type: 'success', message: res.message || 'Booking request submitted!' });
      setBookingModal((p) => ({ ...p, isOpen: false, loading: false }));
      if (activeTab !== 'catalog') fetchBookings();
    } catch (err) {
      setBookingModal((p) => ({
        ...p,
        loading: false,
        conflictError: err.message,
      }));
    }
  };

  // Admin Handle Review Submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setReviewModal((p) => ({ ...p, loading: true }));
      await api.put(`/bookings/${reviewModal.bookingId}/status`, {
        status: reviewModal.status,
        adminRemarks: reviewModal.adminRemarks,
      });
      setFeedback({
        type: 'success',
        message: `Booking has been ${reviewModal.status} successfully.`,
      });
      setReviewModal((p) => ({ ...p, isOpen: false, loading: false }));
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Status update failed.');
      setReviewModal((p) => ({ ...p, loading: false }));
    }
  };

  // Admin Handle Resource Save
  const handleSaveResource = async (e) => {
    e.preventDefault();
    try {
      setResourceModal((p) => ({ ...p, loading: true }));
      const featuresArray = typeof resourceModal.formData.features === 'string'
        ? resourceModal.formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : resourceModal.formData.features;

      const payload = {
        ...resourceModal.formData,
        features: featuresArray,
        capacity: Number(resourceModal.formData.capacity),
      };

      if (resourceModal.mode === 'create') {
        await api.post('/resources', payload);
        setFeedback({ type: 'success', message: 'Resource created successfully.' });
      } else {
        await api.put(`/resources/${resourceModal.resourceId}`, payload);
        setFeedback({ type: 'success', message: 'Resource details updated.' });
      }
      setResourceModal((p) => ({ ...p, isOpen: false, loading: false }));
      fetchResources();
    } catch (err) {
      alert(err.message || 'Failed to save resource.');
      setResourceModal((p) => ({ ...p, loading: false }));
    }
  };

  // Delete Resource
  const handleDeleteResource = async () => {
    try {
      setDeleteResourceModal((p) => ({ ...p, loading: true }));
      await api.delete(`/resources/${deleteResourceModal.resourceId}`);
      setFeedback({ type: 'success', message: 'Resource removed.' });
      setDeleteResourceModal({ isOpen: false, resourceId: null, loading: false });
      fetchResources();
    } catch (err) {
      alert(err.message || 'Cannot delete resource.');
      setDeleteResourceModal((p) => ({ ...p, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Campus Facilities & Equipment
            </h1>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">
              Conflict-Free Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reserve auditoriums, laboratories, smart classrooms, and AV kits with automatic overlap checks
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() =>
              setResourceModal({
                isOpen: true,
                mode: 'create',
                resourceId: null,
                loading: false,
                formData: {
                  name: '',
                  category: 'Seminar Hall',
                  code: '',
                  location: '',
                  capacity: 50,
                  features: 'Projector, WiFi, AC, Audio System',
                  isAvailable: true,
                  maintenanceStatus: 'Operational',
                  description: '',
                  imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
                },
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Add New Resource
          </button>
        )}
      </div>

      {/* Feedback banner */}
      {feedback.message && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'catalog'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Facility Catalogue
        </button>
        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'my-bookings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Bookings
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('all-bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'all-bookings'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Campus Requests (Admin)
          </button>
        )}
      </div>

      {/* TAB 1: FACILITY CATALOGUE */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Category Filter */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search facility name, code, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Cards Grid */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading campus facilities...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Resources Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try selecting another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res) => {
                const isOp = res.maintenanceStatus === 'Operational' && res.isAvailable;
                return (
                  <div
                    key={res._id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-44 bg-slate-800 overflow-hidden">
                        <img
                          src={
                            res.imageUrl ||
                            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600'
                          }
                          alt={res.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <Badge value={res.category} size="xs" />
                          <span className="text-[10px] font-mono font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {res.code}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge value={res.maintenanceStatus} size="xs" />
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="font-extrabold text-base text-slate-900 mb-1 leading-snug">
                          {res.name}
                        </h3>

                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{res.location}</span>
                          <span>•</span>
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Capacity: {res.capacity}</span>
                        </p>

                        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                          {res.description || 'Standard university instructional facility.'}
                        </p>

                        {/* Features Badges */}
                        {res.features && res.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {res.features.map((feat, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setResourceModal({
                                isOpen: true,
                                mode: 'edit',
                                resourceId: res._id,
                                loading: false,
                                formData: {
                                  name: res.name,
                                  category: res.category,
                                  code: res.code,
                                  location: res.location,
                                  capacity: res.capacity,
                                  features: Array.isArray(res.features)
                                    ? res.features.join(', ')
                                    : res.features,
                                  isAvailable: res.isAvailable,
                                  maintenanceStatus: res.maintenanceStatus,
                                  description: res.description,
                                  imageUrl: res.imageUrl,
                                },
                              })
                            }
                            className="p-1.5 text-slate-600 hover:text-amber-600 rounded-lg hover:bg-slate-200/50"
                            title="Edit Resource"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteResourceModal({
                                isOpen: true,
                                resourceId: res._id,
                                loading: false,
                              })
                            }
                            className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-slate-200/50"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() =>
                          setBookingModal({
                            isOpen: true,
                            resource: res,
                            loading: false,
                            conflictError: null,
                            formData: {
                              bookingDate: new Date().toISOString().split('T')[0],
                              startTime: '09:00',
                              endTime: '11:00',
                              purpose: '',
                              attendeesCount: Math.min(30, res.capacity),
                            },
                          })
                        }
                        disabled={!isOp}
                        className={`ml-auto px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                          isOp
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isOp ? 'Book Facility' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2 & 3: BOOKINGS TABLES (My Bookings or All Bookings) */}
      {(activeTab === 'my-bookings' || activeTab === 'all-bookings') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {activeTab === 'all-bookings'
                  ? 'All Campus Facility Bookings (Administrative Review)'
                  : 'My Booking Requests & Reservation History'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every reservation undergoes automated time-slot overlap verification.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {bookings.length} Bookings
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading booking records...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No booking records found in this category.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Resource / Facility</th>
                    <th className="px-5 py-3">Applicant</th>
                    <th className="px-5 py-3">Booking Slot</th>
                    <th className="px-5 py-3">Purpose & Attendees</th>
                    <th className="px-5 py-3">Status</th>
                    {isAdmin && activeTab === 'all-bookings' && (
                      <th className="px-5 py-3 text-right">Admin Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-800">{b.resource?.name || 'Resource'}</div>
                        <div className="text-[10px] text-slate-400">
                          {b.resource?.code} • {b.resource?.location}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{b.user?.name || 'Applicant'}</div>
                        <div className="text-[10px] text-slate-400">
                          {b.user?.department} • <span className="capitalize">{b.user?.role}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-700">📅 {b.bookingDate}</div>
                        <div className="text-[11px] text-blue-600 font-mono">
                          ⏰ {b.startTime} - {b.endTime}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="font-medium text-slate-800 line-clamp-1">{b.purpose}</div>
                        <div className="text-[10px] text-slate-400">
                          {b.attendeesCount} Expected Attendees
                        </div>
                        {b.adminRemarks && (
                          <div className="mt-1 text-[10px] text-slate-500 italic bg-slate-100 px-2 py-0.5 rounded">
                            Remark: {b.adminRemarks}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge value={b.status} size="sm" />
                      </td>
                      {isAdmin && activeTab === 'all-bookings' && (
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {b.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() =>
                                  setReviewModal({
                                    isOpen: true,
                                    bookingId: b._id,
                                    status: 'approved',
                                    adminRemarks: 'Approved by campus administration.',
                                    loading: false,
                                  })
                                }
                                className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  setReviewModal({
                                    isOpen: true,
                                    bookingId: b._id,
                                    status: 'rejected',
                                    adminRemarks: 'Facility required for official university examination.',
                                    loading: false,
                                  })
                                }
                                className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setReviewModal({
                                  isOpen: true,
                                  bookingId: b._id,
                                  status: b.status === 'approved' ? 'rejected' : 'approved',
                                  adminRemarks: b.adminRemarks,
                                  loading: false,
                                })
                              }
                              className="text-[11px] text-slate-500 hover:text-blue-600 font-semibold"
                            >
                              Change Status
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* BOOKING MODAL (With Conflict Detector) */}
      <Modal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal((p) => ({ ...p, isOpen: false }))}
        title="Reserve Campus Facility"
        subtitle={bookingModal.resource?.name}
        maxWidth="max-w-xl"
      >
        {bookingModal.conflictError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Booking Conflict Warning</p>
              <p className="mt-0.5 leading-relaxed">{bookingModal.conflictError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Booking Date *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={bookingModal.formData.bookingDate}
              onChange={(e) =>
                setBookingModal((p) => ({
                  ...p,
                  formData: { ...p.formData, bookingDate: e.target.value },
                }))
              }
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Start Time (24h) *
              </label>
              <input
                type="time"
                required
                value={bookingModal.formData.startTime}
                onChange={(e) =>
                  setBookingModal((p) => ({
                    ...p,
                    formData: { ...p.formData, startTime: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                End Time (24h) *
              </label>
              <input
                type="time"
                required
                value={bookingModal.formData.endTime}
                onChange={(e) =>
                  setBookingModal((p) => ({
                    ...p,
                    formData: { ...p.formData, endTime: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Purpose of Reservation *
            </label>
            <textarea
              required
              rows={3}
              value={bookingModal.formData.purpose}
              onChange={(e) =>
                setBookingModal((p) => ({
                  ...p,
                  formData: { ...p.formData, purpose: e.target.value },
                }))
              }
              placeholder="e.g. ACM Student Chapter Technical Seminar on Cloud Architecture"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Expected Number of Attendees
            </label>
            <input
              type="number"
              min="1"
              max={bookingModal.resource?.capacity || 1000}
              value={bookingModal.formData.attendeesCount}
              onChange={(e) =>
                setBookingModal((p) => ({
                  ...p,
                  formData: { ...p.formData, attendeesCount: e.target.value },
                }))
              }
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBookingModal((p) => ({ ...p, isOpen: false }))}
              className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingModal.loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {bookingModal.loading ? 'Checking Conflicts...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADMIN REVIEW BOOKING MODAL */}
      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal((p) => ({ ...p, isOpen: false }))}
        title="Admin Facility Booking Review"
        subtitle="Approve or reject booking request"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Decision Status *
            </label>
            <select
              value={reviewModal.status}
              onChange={(e) => setReviewModal((p) => ({ ...p, status: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
            >
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Administrative Remarks / Feedback
            </label>
            <textarea
              rows={3}
              value={reviewModal.adminRemarks}
              onChange={(e) =>
                setReviewModal((p) => ({ ...p, adminRemarks: e.target.value }))
              }
              placeholder="Provide approval conditions or reason for rejection..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReviewModal((p) => ({ ...p, isOpen: false }))}
              className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={reviewModal.loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
            >
              {reviewModal.loading ? 'Updating...' : 'Save Decision'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADMIN CREATE / EDIT RESOURCE MODAL */}
      <Modal
        isOpen={resourceModal.isOpen}
        onClose={() => setResourceModal((p) => ({ ...p, isOpen: false }))}
        title={resourceModal.mode === 'create' ? 'Add Campus Resource' : 'Update Resource'}
        subtitle="Manage classrooms, laboratories, auditoriums, and equipment"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveResource} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Resource Name *
              </label>
              <input
                type="text"
                required
                value={resourceModal.formData.name}
                onChange={(e) =>
                  setResourceModal((p) => ({
                    ...p,
                    formData: { ...p.formData, name: e.target.value },
                  }))
                }
                placeholder="e.g. Turing AI Lab"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Category *
              </label>
              <select
                value={resourceModal.formData.category}
                onChange={(e) =>
                  setResourceModal((p) => ({
                    ...p,
                    formData: { ...p.formData, category: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Identifier / Room Code *
              </label>
              <input
                type="text"
                required
                value={resourceModal.formData.code}
                onChange={(e) =>
                  setResourceModal((p) => ({
                    ...p,
                    formData: { ...p.formData, code: e.target.value },
                  }))
                }
                placeholder="e.g. LAB-CSE-301"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Seating Capacity / Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={resourceModal.formData.capacity}
                onChange={(e) =>
                  setResourceModal((p) => ({
                    ...p,
                    formData: { ...p.formData, capacity: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Campus Location *
            </label>
            <input
              type="text"
              required
              value={resourceModal.formData.location}
              onChange={(e) =>
                setResourceModal((p) => ({
                  ...p,
                  formData: { ...p.formData, location: e.target.value },
                }))
              }
              placeholder="e.g. Computer Science Block, 3rd Floor"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Features (Comma separated)
            </label>
            <input
              type="text"
              value={resourceModal.formData.features}
              onChange={(e) =>
                setResourceModal((p) => ({
                  ...p,
                  formData: { ...p.formData, features: e.target.value },
                }))
              }
              placeholder="e.g. Dual 4K Projectors, Dolby Sound, High-Speed WiFi, AC"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Maintenance Status
              </label>
              <select
                value={resourceModal.formData.maintenanceStatus}
                onChange={(e) =>
                  setResourceModal((p) => ({
                    ...p,
                    formData: { ...p.formData, maintenanceStatus: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="Operational">Operational</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Out of Order">Out of Order</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={resourceModal.formData.imageUrl}
                onChange={(e) =>
                  setResourceModal((p) => ({
                    ...p,
                    formData: { ...p.formData, imageUrl: e.target.value },
                  }))
                }
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setResourceModal((p) => ({ ...p, isOpen: false }))}
              className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resourceModal.loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
            >
              {resourceModal.loading ? 'Saving...' : 'Save Resource'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE RESOURCE CONFIRMATION */}
      <ConfirmationDialog
        isOpen={deleteResourceModal.isOpen}
        onClose={() => setDeleteResourceModal({ isOpen: false, resourceId: null, loading: false })}
        onConfirm={handleDeleteResource}
        loading={deleteResourceModal.loading}
        title="Remove Facility Resource?"
        message="Are you sure you want to delete this resource? If active bookings exist, you must resolve them first."
        confirmText="Yes, Delete Resource"
        type="danger"
      />
    </div>
  );
};

export default ResourceBookingPage;
