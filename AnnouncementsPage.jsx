import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Bell,
  Search,
  Filter,
  Plus,
  Pin,
  Calendar,
  User,
  Building,
  AlertTriangle,
  Trash2,
  Edit,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';

export const AnnouncementsPage = () => {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Publish / Edit Modal
  const [announcementModal, setAnnouncementModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    id: null,
    loading: false,
    formData: {
      title: '',
      content: '',
      category: 'General',
      department: user?.department || 'All Departments',
      priority: 'medium',
      isPinned: false,
    },
  });

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    loading: false,
  });

  const departments = [
    'All',
    'All Departments',
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics and Communication',
    'Electrical and Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  const categories = ['General', 'Academic', 'Exam', 'Event', 'Placement', 'Sports', 'Emergency'];
  const priorities = ['All', 'urgent', 'high', 'medium', 'low'];

  const canPublish = user?.role === 'admin' || user?.role === 'faculty';

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept !== 'All') params.department = selectedDept;
      if (selectedPriority !== 'All') params.priority = selectedPriority;
      if (search) params.search = search;
      const data = await api.get('/announcements', { params });
      setAnnouncements(data.announcements || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load announcements.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedDept, selectedPriority, search]);

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setAnnouncementModal((p) => ({ ...p, loading: true }));
      if (announcementModal.mode === 'create') {
        await api.post('/announcements', announcementModal.formData);
        setFeedback({ type: 'success', message: 'Announcement published successfully!' });
      } else {
        await api.put(`/announcements/${announcementModal.id}`, announcementModal.formData);
        setFeedback({ type: 'success', message: 'Announcement updated.' });
      }
      setAnnouncementModal((p) => ({ ...p, isOpen: false, loading: false }));
      fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to publish announcement.');
      setAnnouncementModal((p) => ({ ...p, loading: false }));
    }
  };

  const handleDeleteAnnouncement = async () => {
    try {
      setDeleteModal((p) => ({ ...p, loading: true }));
      await api.delete(`/announcements/${deleteModal.id}`);
      setFeedback({ type: 'success', message: 'Announcement deleted.' });
      setDeleteModal({ isOpen: false, id: null, loading: false });
      fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to delete announcement.');
      setDeleteModal((p) => ({ ...p, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              University Bulletins & Circulars
            </h1>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">
              {announcements.length} Published
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official announcements, academic exam notifications, and campus event broadcasts
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() =>
              setAnnouncementModal({
                isOpen: true,
                mode: 'create',
                id: null,
                loading: false,
                formData: {
                  title: '',
                  content: '',
                  category: 'General',
                  department: user?.department || 'All Departments',
                  priority: 'medium',
                  isPinned: false,
                },
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Publish Announcement
          </button>
        )}
      </div>

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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search circulars by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                Dept: {d}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 capitalize"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Fetching circulars...
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Announcements Found</h3>
          <p className="text-xs text-slate-500 mt-1">There are no circulars matching your filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => {
            const isAuthor =
              user?._id === (a.author?._id || a.author) || user?.role === 'admin';
            return (
              <div
                key={a._id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition duration-200 shadow-sm ${
                  a.priority === 'urgent'
                    ? 'border-rose-300 bg-rose-50/20'
                    : a.isPinned
                    ? 'border-blue-300 bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {a.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200">
                        <Pin className="w-3 h-3 fill-current" /> Pinned
                      </span>
                    )}
                    <Badge value={a.priority} size="xs" />
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {a.category}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {a.department}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(a.createdAt).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2 leading-snug">
                  {a.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                  {a.content}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] uppercase">
                      {(a.authorName || a.author?.name || 'A').charAt(0)}
                    </div>
                    <span>
                      Published by: <strong className="text-slate-700">{a.authorName || a.author?.name || 'Administration'}</strong>{' '}
                      <span className="capitalize text-[11px] text-slate-400">({a.authorRole || a.author?.role || 'Staff'})</span>
                    </span>
                  </div>

                  {isAuthor && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setAnnouncementModal({
                            isOpen: true,
                            mode: 'edit',
                            id: a._id,
                            loading: false,
                            formData: {
                              title: a.title,
                              content: a.content,
                              category: a.category,
                              department: a.department,
                              priority: a.priority,
                              isPinned: a.isPinned,
                            },
                          })
                        }
                        className="p-1 text-slate-400 hover:text-amber-600"
                        title="Edit Announcement"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({ isOpen: true, id: a._id, loading: false })
                        }
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PUBLISH ANNOUNCEMENT MODAL */}
      <Modal
        isOpen={announcementModal.isOpen}
        onClose={() => setAnnouncementModal((p) => ({ ...p, isOpen: false }))}
        title={announcementModal.mode === 'create' ? 'Publish Campus Circular' : 'Edit Circular'}
        subtitle="Broadcast notices to university departments and students"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={announcementModal.formData.title}
              onChange={(e) =>
                setAnnouncementModal((p) => ({
                  ...p,
                  formData: { ...p.formData, title: e.target.value },
                }))
              }
              placeholder="e.g. Schedule of Practical Laboratory Examinations"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Category *
              </label>
              <select
                value={announcementModal.formData.category}
                onChange={(e) =>
                  setAnnouncementModal((p) => ({
                    ...p,
                    formData: { ...p.formData, category: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Priority *
              </label>
              <select
                value={announcementModal.formData.priority}
                onChange={(e) =>
                  setAnnouncementModal((p) => ({
                    ...p,
                    formData: { ...p.formData, priority: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl capitalize"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent (Broadcasts Alerts)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Target Department *
            </label>
            <select
              value={announcementModal.formData.department}
              onChange={(e) =>
                setAnnouncementModal((p) => ({
                  ...p,
                  formData: { ...p.formData, department: e.target.value },
                }))
              }
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
            >
              {departments.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Notice Content *
            </label>
            <textarea
              required
              rows={4}
              value={announcementModal.formData.content}
              onChange={(e) =>
                setAnnouncementModal((p) => ({
                  ...p,
                  formData: { ...p.formData, content: e.target.value },
                }))
              }
              placeholder="Detailed instructions, dates, deadlines, and contact information..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinAnnouncement"
              checked={announcementModal.formData.isPinned}
              onChange={(e) =>
                setAnnouncementModal((p) => ({
                  ...p,
                  formData: { ...p.formData, isPinned: e.target.checked },
                }))
              }
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="pinAnnouncement" className="text-xs font-medium text-slate-700">
              Pin to top of bulletin board
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAnnouncementModal((p) => ({ ...p, isOpen: false }))}
              className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={announcementModal.loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
            >
              {announcementModal.loading ? 'Publishing...' : 'Publish Circular'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <ConfirmationDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, loading: false })}
        onConfirm={handleDeleteAnnouncement}
        loading={deleteModal.loading}
        title="Delete University Bulletin?"
        message="Are you sure you want to delete this notice? This action will remove it from all student feeds."
        confirmText="Yes, Delete Notice"
        type="danger"
      />
    </div>
  );
};

export default AnnouncementsPage;
