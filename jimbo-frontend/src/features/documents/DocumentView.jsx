import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const statusLabels = {
  pending: 'Awaiting Approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

// Use the API base URL to build the link to the uploaded file (uploads static)
const API_ORIGIN = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

export default function DocumentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [document, setDocument] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Ruhusa ya kufuta - inaoana na documentRoutes.js (backend): admin pekee.
  const canDelete = isAdmin;

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get(`/documents/${id}`);
      setDocument(data);
      setComment(data.approvalComment || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load the document.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const decide = async (status) => {
    setActing(true);
    setError('');

    try {
      await api.patch(`/documents/${id}/status`, {
        status,
        approvalComment: comment,
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the document status.');
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/documents/${id}`);
      navigate('/documents');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the document.');
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-8 text-base text-black">Loading...</div>;
  }

  if (!document) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-base text-red-600">{error || 'Document not found.'}</p>
      </div>
    );
  }

  const fileUrl = `${API_ORIGIN}/${document.filePath.replace(/\\/g, '/').split('/backend/')[1] || document.filePath}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">{document.title}</h1>

        <Link to="/documents" className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-base">
        <div>
          <p className="text-sm text-black">Type</p>
          <p className="font-semibold text-black capitalize">{document.documentType}</p>
        </div>

        <div>
          <p className="text-sm text-black">Status</p>
          <span className={`inline-block text-sm font-medium px-2 py-1 rounded-md ${statusColors[document.status]}`}>
            {statusLabels[document.status]}
          </span>
        </div>

        <div>
          <p className="text-sm text-black">Shared By</p>
          <p className="font-semibold text-black">{document.uploadedBy?.fullName || '-'}</p>
        </div>

        <div>
          <p className="text-sm text-black">Approved/Rejected By</p>
          <p className="font-semibold text-black">{document.approvedBy?.fullName || '-'}</p>
        </div>
      </div>

      {document.description && (
        <div className="mb-4">
          <p className="text-sm text-black mb-1">Description</p>
          <p className="text-base text-black">{document.description}</p>
        </div>
      )}

      {/* FILE */}
      <div className="border rounded-lg p-4 bg-gray-50 mb-6">
        <p className="text-sm text-black mb-2">Uploaded File</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[#0B2A4A] hover:underline text-base font-medium"
        >
          📄 {document.fileName} (Open/Download)
        </a>
      </div>

      {/* APPROVAL - ADMIN ONLY */}
      {isAdmin && document.status === 'pending' && (
        <div className="border border-[#0B2A4A]/20 rounded-lg p-4 bg-blue-50/40 mb-6">
          <label className="block text-base font-semibold text-[#0B2A4A] mb-2">
            Approval Comment (optional)
          </label>

          <textarea
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-base text-black mb-3"
            placeholder="Write your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              disabled={acting}
              onClick={() => decide('approved')}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-base font-medium px-4 py-2 rounded-md"
            >
              ✅ Approve
            </button>

            <button
              disabled={acting}
              onClick={() => decide('rejected')}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-base font-medium px-4 py-2 rounded-md"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      )}

      {document.approvalComment && document.status !== 'pending' && (
        <div className="mb-6">
          <p className="text-sm text-black mb-1">Approval Comment</p>
          <p className="text-base text-black">{document.approvalComment}</p>
        </div>
      )}

      {/* DELETE */}
      {canDelete && (
        <div className="pt-4 border-t">
          <button
            onClick={handleDelete}
            className="text-red-600 hover:underline text-sm font-medium"
          >
            Delete This Document
          </button>
        </div>
      )}
    </div>
  );
}
