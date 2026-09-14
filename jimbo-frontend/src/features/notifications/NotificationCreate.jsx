import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function NotificationCreate() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [broadcastToAll, setBroadcastToAll] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [link, setLink] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users', { params: { isActive: true } });
        setUsers(res.data);
      } catch {
        // the list of users is not required for "send to all"
      }
    })();
  }, []);

  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !message.trim()) {
      setError('Fill in the notification title and message.');
      return;
    }

    if (!broadcastToAll && selectedUserIds.length === 0) {
      setError('Select at least one recipient, or choose "Send to All".');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/notifications', {
        broadcastToAll,
        userIds: broadcastToAll ? undefined : selectedUserIds,
        title: title.trim(),
        message: message.trim(),
        type,
        link: link.trim() || null,
      });

      setSuccess(res.data.message || 'Notification sent.');
      setTitle('');
      setMessage('');
      setLink('');
      setSelectedUserIds([]);

      setTimeout(() => navigate('/notifications'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send the notification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
      <Link to="/notifications" className="text-black hover:underline text-sm font-medium">
        &larr; Back to Notifications
      </Link>

      <h1 className="text-2xl font-bold text-black mt-4 mb-1">Send Notification</h1>
      <p className="text-sm text-black mb-6">
        Send a notification to one user, several users, or all users of the system.
      </p>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}
      {success && (
        <div className="text-sm bg-green-50 text-green-700 px-3 py-2 rounded-md mb-4">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* RECIPIENTS */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
            <input
              type="checkbox"
              checked={broadcastToAll}
              onChange={(e) => setBroadcastToAll(e.target.checked)}
            />
            Send to All Users
          </label>

          {!broadcastToAll && (
            <div className="border rounded-md max-h-48 overflow-y-auto divide-y">
              {users.length === 0 ? (
                <p className="text-sm text-black px-3 py-2">No users available to select.</p>
              ) : (
                users.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 text-black">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                    />
                    <span>{u.fullName}</span>
                    <span className="text-black text-xs">({u.email})</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {/* TYPE */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">Notification Type</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm text-black"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* TITLE */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">Title</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm text-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Your request has been approved"
          />
        </div>

        {/* MESSAGE */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">Message</label>
          <textarea
            rows={4}
            className="w-full border rounded-md px-3 py-2 text-sm text-black"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write the notification message here..."
          />
        </div>

        {/* LINK (OPTIONAL) */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Internal Link (optional)
          </label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm text-black"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Example: /applications/12"
          />
          <p className="text-xs text-black mt-1">
            The user will be taken here when they click this notification.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-5 py-2 rounded-md disabled:opacity-60"
          >
            {saving ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  );
}
