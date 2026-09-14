import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

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

export default function NotificationView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/notifications/${id}`);
        setNotification(res.data);

        // If it hasn't been read yet, mark it as read once the page is opened
        if (!res.data.isRead) {
          await api.patch(`/notifications/${id}/read`);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch the notification.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      navigate('/notifications');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the notification.');
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-8 text-black text-sm">Loading...</div>;
  }

  if (error || !notification) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error || 'Notification not found.'}
        </div>
        <Link to="/notifications" className="text-black hover:underline text-sm font-medium">
          &larr; Back to Notifications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
      <Link to="/notifications" className="text-black hover:underline text-sm font-medium">
        &larr; Back to Notifications
      </Link>

      <div className="flex items-center justify-between mt-4 mb-2 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-black">{notification.title}</h1>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeStyles[notification.type] || 'bg-gray-100 text-black'}`}>
          {typeLabels[notification.type] || notification.type}
        </span>
      </div>

      <p className="text-xs text-black mb-6">
        {formatDateTime(notification.createdAt)}
        {notification.createdBy?.fullName ? ` • from ${notification.createdBy.fullName}` : ''}
      </p>

      <p className="text-black whitespace-pre-line leading-relaxed">{notification.message}</p>

      <div className="flex items-center gap-3 mt-8 pt-4 border-t">
        {notification.link && (
          <button
            onClick={() => navigate(notification.link)}
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Open Related Item
          </button>
        )}
        <button
          onClick={handleDelete}
          className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-md"
        >
          Delete Notification
        </button>
      </div>
    </div>
  );
}
