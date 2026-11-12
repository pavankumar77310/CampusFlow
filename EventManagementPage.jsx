import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';

export const EventManagementPage = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Create / Edit Event Modal State
  const [eventModal, setEventModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    eventId: null,
    loading: false,
    formData: {
      title: '',
      description: '',
      category: 'Technical',
      date: '',
      startTime: '10:00',
      endTime: '16:00',
      venue: '',
      department: user?.department || 'Computer Science and Engineering',
      maxCapacity: 100,
      bannerUrl: '',
    },
  });

  // Attendees Modal
  const [attendeeModal, setAttendeeModal] = useState({
    isOpen: false,
    eventTitle: '',
    loading: false,
    participants: [],
  });

  // Delete Confirm Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    eventId: null,
    loading: false,
  });

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar', 'Placement'];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search) params.search = search;
      const data = await api.get('/events', { params });
      setEvents(data.events || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch events.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, search]);

  const canManage = user?.role === 'admin' || user?.role === 'faculty';

  // Open Create Modal
  const handleOpenCreate = () => {
    setEventModal({
      isOpen: true,
      mode: 'create',
      eventId: null,
      loading: false,
      formData: {
        title: '',
        description: '',
        category: 'Technical',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '16:00',
        venue: 'Sir C.V. Raman Central Auditorium',
        department: user?.department || 'Computer Science and Engineering',
        maxCapacity: 100,
        bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      },
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (ev) => {
    setEventModal({
      isOpen: true,
      mode: 'edit',
      eventId: ev._id,
      loading: false,
      formData: {
        title: ev.title,
        description: ev.description,
        category: ev.category,
        date: ev.date,
        startTime: ev.startTime,
        endTime: ev.endTime,
        venue: ev.venue,
        department: ev.department,
        maxCapacity: ev.maxCapacity,
        bannerUrl: ev.bannerUrl || '',
      },
    });
  };

  // Save Event (Create or Update)
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      setEventModal((p) => ({ ...p, loading: true }));
      if (eventModal.mode === 'create') {
        await api.post('/events', eventModal.formData);
        setFeedback({ type: 'success', message: 'Event published successfully!' });
      } else {
        await api.put(`/events/${eventModal.eventId}`, eventModal.formData);
        setFeedback({ type: 'success', message: 'Event details updated!' });
      }
      setEventModal((p) => ({ ...p, isOpen: false, loading: false }));
      fetchEvents();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save event.' });
      setEventModal((p) => ({ ...p, loading: false }));
    }
  };

  // Delete Event
  const handleDeleteEvent = async () => {
    try {
      setDeleteModal((p) => ({ ...p, loading: true }));
      await api.delete(`/events/${deleteModal.eventId}`);
      setFeedback({ type: 'success', message: 'Event removed from campus schedule.' });
      setDeleteModal({ isOpen: false, eventId: null, loading: false });
      fetchEvents();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete event.' });
      setDeleteModal((p) => ({ ...p, loading: false }));
    }
  };

  // Register for Event
  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      setFeedback({ type: 'success', message: 'Successfully registered for this event!' });
      fetchEvents();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Registration failed.' });
    }
  };

  // Cancel Registration
  const handleCancelRegistration = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/cancel`);
      setFeedback({ type: 'info', message: 'Event registration cancelled.' });
      fetchEvents();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Cancellation failed.' });
    }
  };

  // View Attendees Roster
  const handleViewAttendees = async (ev) => {
    try {
      setAttendeeModal({ isOpen: true, eventTitle: ev.title, loading: true, participants: [] });
      const data = await api.get(`/events/${ev._id}/participants`);
      setAttendeeModal({
        isOpen: true,
        eventTitle: ev.title,
        loading: false,
        participants: data.participants || [],
      });
    } catch (err) {
      alert(err.message || 'Could not load attendee roster.');
      setAttendeeModal((p) => ({ ...p, isOpen: false, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Campus Events & Workshops
            </h1>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">
              {events.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Discover conferences, seminars, coding bootcamps, and cultural festivals
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Create New Event
          </button>
        )}
      </div>

      {/* Alert / Feedback */}
      {feedback.message && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : feedback.type === 'info'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="font-bold ml-3 text-current opacity-70 hover:opacity-100"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search event title, venue, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
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

      {/* Events Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Fetching university events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Events Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No events match your current filter criteria. Check back soon or create a new event.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const seatsLeft = Math.max(0, ev.maxCapacity - ev.registeredCount);
            const isFull = seatsLeft === 0;
            const progress = Math.min(100, Math.round((ev.registeredCount / ev.maxCapacity) * 100));

            return (
              <div
                key={ev._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Banner image */}
                  <div className="relative h-44 bg-slate-800 overflow-hidden">
                    <img
                      src={
                        ev.bannerUrl ||
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
                      }
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge value={ev.category} size="xs" />
                      <span className="text-[10px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {ev.department}
                      </span>
                    </div>

                    {ev.isRegistered && (
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Registered
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-600 mb-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ev.date}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ev.startTime} - {ev.endTime}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 mb-2 leading-snug line-clamp-2">
                      {ev.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>Organized by: {ev.organizerName || ev.organizer?.name || 'Department'}</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                        <span>
                          Seats: <strong className="text-slate-800">{ev.registeredCount}</strong> / {ev.maxCapacity}
                        </span>
                        <span className={isFull ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                          {isFull ? 'Housefull' : `${seatsLeft} seats left`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isFull ? 'bg-rose-500' : progress > 80 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Left: Organizer/Admin tools */}
                  {canManage && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleViewAttendees(ev)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-200/60 rounded-lg transition"
                        title="View Registered Attendees"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(ev)}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-200/60 rounded-lg transition"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({ isOpen: true, eventId: ev._id, loading: false })
                        }
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-200/60 rounded-lg transition"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Right: Registration / Cancellation button */}
                  <div className="ml-auto">
                    {ev.isRegistered ? (
                      <button
                        onClick={() => handleCancelRegistration(ev._id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                      >
                        Cancel Registration
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(ev._id)}
                        disabled={isFull}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                          isFull
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isFull ? 'Fully Booked' : 'Register Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Event Modal */}
      <Modal
        isOpen={eventModal.isOpen}
        onClose={() => setEventModal((p) => ({ ...p, isOpen: false }))}
        title={eventModal.mode === 'create' ? 'Create Campus Event' : 'Edit Event Details'}
        subtitle="Publish academic conferences, hackathons, or workshops"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={eventModal.formData.title}
              onChange={(e) =>
                setEventModal((p) => ({
                  ...p,
                  formData: { ...p.formData, title: e.target.value },
                }))
              }
              placeholder="e.g. Annual Smart India Hackathon 2026"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Category *
              </label>
              <select
                value={eventModal.formData.category}
                onChange={(e) =>
                  setEventModal((p) => ({
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={eventModal.formData.department}
                onChange={(e) =>
                  setEventModal((p) => ({
                    ...p,
                    formData: { ...p.formData, department: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={eventModal.formData.description}
              onChange={(e) =>
                setEventModal((p) => ({
                  ...p,
                  formData: { ...p.formData, description: e.target.value },
                }))
              }
              placeholder="Outline event agenda, prerequisites, and keynote speakers..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={eventModal.formData.date}
                onChange={(e) =>
                  setEventModal((p) => ({
                    ...p,
                    formData: { ...p.formData, date: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={eventModal.formData.startTime}
                onChange={(e) =>
                  setEventModal((p) => ({
                    ...p,
                    formData: { ...p.formData, startTime: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={eventModal.formData.endTime}
                onChange={(e) =>
                  setEventModal((p) => ({
                    ...p,
                    formData: { ...p.formData, endTime: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Venue Location *
              </label>
              <input
                type="text"
                required
                value={eventModal.formData.venue}
                onChange={(e) =>
                  setEventModal((p) => ({
                    ...p,
                    formData: { ...p.formData, venue: e.target.value },
                  }))
                }
                placeholder="e.g. Sir C.V. Raman Central Auditorium"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Maximum Seating Capacity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={eventModal.formData.maxCapacity}
                onChange={(e) =>
                  setEventModal((p) => ({
                    ...p,
                    formData: { ...p.formData, maxCapacity: Number(e.target.value) },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Banner Image URL (Optional)
            </label>
            <input
              type="url"
              value={eventModal.formData.bannerUrl}
              onChange={(e) =>
                setEventModal((p) => ({
                  ...p,
                  formData: { ...p.formData, bannerUrl: e.target.value },
                }))
              }
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEventModal((p) => ({ ...p, isOpen: false }))}
              className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={eventModal.loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {eventModal.loading ? 'Saving Event...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Attendees List Modal */}
      <Modal
        isOpen={attendeeModal.isOpen}
        onClose={() => setAttendeeModal((p) => ({ ...p, isOpen: false }))}
        title="Registered Participants Roster"
        subtitle={`Event: ${attendeeModal.eventTitle}`}
        maxWidth="max-w-2xl"
      >
        {attendeeModal.loading ? (
          <div className="py-8 text-center text-xs text-slate-500">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading participant records...
          </div>
        ) : attendeeModal.participants.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No student participants registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Participant</th>
                  <th className="px-4 py-2.5">ID / Roll No</th>
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5">Year</th>
                  <th className="px-4 py-2.5">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendeeModal.participants.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5">
                      <p className="font-bold text-slate-800">{reg.user?.name}</p>
                      <p className="text-[10px] text-slate-400">{reg.user?.email}</p>
                    </td>
                    <td className="px-4 py-2.5 font-mono">{reg.user?.idNumber}</td>
                    <td className="px-4 py-2.5">{reg.user?.department}</td>
                    <td className="px-4 py-2.5">{reg.user?.yearOfStudy}</td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {new Date(reg.registeredAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, eventId: null, loading: false })}
        onConfirm={handleDeleteEvent}
        loading={deleteModal.loading}
        title="Delete Campus Event?"
        message="This action will permanently delete this event and remove all participant registration records."
        confirmText="Yes, Delete Event"
        type="danger"
      />
    </div>
  );
};

export default EventManagementPage;
