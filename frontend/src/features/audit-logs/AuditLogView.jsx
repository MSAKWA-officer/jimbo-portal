import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'medium' }) : '—';

const actionStyles = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-amber-100 text-amber-700',
  delete: 'bg-red-100 text-red-700',
  login: 'bg-blue-100 text-blue-700',
  logout: 'bg-gray-100 text-gray-500',
};

const actionLabels = {
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  login: 'Login',
  logout: 'Logout',
};

const entityLabels = {
  Request: 'Request',
  Project: 'Project',
  ProjectActivity: 'Project Activity',
  Budget: 'Budget',
  Expenditure: 'Expenditure',
  Payment: 'Payment',
  Event: 'Event',
  Constituent: 'Constituent',
  RequestCategory: 'Category',
  User: 'User',
};

export default function AuditLogView() {
  const { id } = useParams();

  const [log, setLog] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');

      try {
        const res = await api.get(`/audit-logs/${id}`);
        setLog(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load log details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <p className="text-sm text-black">Loading...</p>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error || 'Log not found.'}
        </div>
        <Link to="/audit-logs" className="text-sm text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>
    );
  }

  let prettyChanges = null;
  if (log.changes) {
    try {
      const parsed = typeof log.changes === 'string' ? JSON.parse(log.changes) : log.changes;
      prettyChanges = JSON.stringify(parsed, null, 2);
    } catch {
      prettyChanges = String(log.changes);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {entityLabels[log.entityType] || log.entityType}
            {log.entityId ? ` #${log.entityId}` : ''}
          </h1>
          <p className="text-sm text-black mt-1">{formatDateTime(log.createdAt)}</p>
        </div>

        <Link to="/audit-logs" className="text-sm text-[#0B2A4A] hover:underline">
          &larr; Back
        </Link>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50/40 border border-[#0B2A4A]/20 rounded-xl p-4">
          <p className="text-xs text-black">Action</p>
          <span className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded-full ${actionStyles[log.action] || 'bg-gray-100 text-gray-600'}`}>
            {actionLabels[log.action] || log.action}
          </span>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-xs text-black">User</p>
          <p className="text-sm font-semibold text-black mt-1">
            {log.user?.fullName || 'System'}
            {log.user?.email ? ` (${log.user.email})` : ''}
          </p>
        </div>
      </div>

      {log.description && (
        <div className="mb-6">
          <p className="text-xs font-medium text-black mb-1">Description</p>
          <p className="text-sm text-black">{log.description}</p>
        </div>
      )}

      {log.ipAddress && (
        <div className="mb-6 text-sm text-black">
          IP Address: <span className="font-medium">{log.ipAddress}</span>
        </div>
      )}

      {prettyChanges && (
        <div className="mt-6 border-t pt-4">
          <p className="text-xs font-medium text-black mb-2">Changes (Data)</p>
          <pre className="text-xs bg-gray-50 border rounded-md p-3 overflow-x-auto whitespace-pre-wrap text-black">
            {prettyChanges}
          </pre>
        </div>
      )}
    </div>
  );
}
