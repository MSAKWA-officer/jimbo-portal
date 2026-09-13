import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext.jsx';

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const typeStyles = {
  info: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
};

const typeLabels = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

const typeIcons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '⛔',
};

export default function NotificationList() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState(''); // '', 'true' (read), 'false' (unread)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const load = async (overrideFilter) => {
    setLoading(true);
    setError('');

    const isRead = overrideFilter !== undefined ? overrideFilter : filter;
    const params = {};
    if (isRead) params.isRead = isRead;

    try {
      const res = await api.get('/notifications', { params });
      setList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (value) => {
    setFilter(value);
    load(value);
  };

  const handleOpen = async (notification) => {
    if (!notification.isRead) {
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        setList((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true, readAt: new Date() } : n))
        );
      } catch {
        // not critical if this fails - navigation can still continue
      }
    }
    if (notification.link) {
      navigate(notification.link);
    } else {
      navigate(`/notifications/${notification.id}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notifications.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      setList((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the notification.');
    }
  };

  const unreadCount = list.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black">Notifications</h1>
          <p className="text-sm text-black mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`
              : 'No new notifications at this time.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/notifications/send')}
              className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
            >
              + Send Notification
            </button>
          )}
          <button
            onClick={handleMarkAllRead}
            className="bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium px-4 py-2 rounded-md"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* FILTER */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {[
          { value: '', label: 'All' },
          { value: 'false', label: 'Unread' },
          { value: 'true', label: 'Read' },
        ].map((f) => (
          <button
            key={f.value || 'all'}
            onClick={() => handleFilter(f.value)}
            className={`text-sm px-3 py-1.5 rounded-md font-medium ${
              filter === f.value
                ? 'bg-[#0B2A4A] text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="border rounded-xl overflow-hidden divide-y">
        {loading ? (
          <div className="px-4 py-6 text-black text-sm">Loading...</div>
        ) : list.length === 0 ? (
          <div className="px-4 py-6 text-black text-sm">No notifications found.</div>
        ) : (
          list.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                !n.isRead ? 'bg-blue-50/50' : ''
              }`}
              onClick={() => handleOpen(n)}
            >
              <span className="text-lg mt-0.5">{typeIcons[n.type] || 'ℹ️'}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm text-black ${!n.isRead ? 'font-semibold' : ''}`}>
                    {n.title}
                  </p>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeStyles[n.type] || 'bg-gray-100 text-black'}`}>
                    {typeLabels[n.type] || n.type}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#0B2A4A]" title="Unread" />
                  )}
                </div>
                <p className="text-sm text-black truncate mt-0.5">{n.message}</p>
                <p className="text-xs text-black mt-1">
                  {formatDateTime(n.createdAt)}
                  {n.createdBy?.fullName ? ` • from ${n.createdBy.fullName}` : ''}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(n.id);
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                title="Delete"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
