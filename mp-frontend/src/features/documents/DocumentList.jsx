import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

// baseURL ya axios ina `/api` mwishoni, lakini faili (uploads) zinatolewa
// na backend kwenye mzizi (`/uploads`), siyo `/api/uploads`. Kwa hiyo
// tunaondoa `/api` kwenye baseURL kabla ya kujenga fileUrl.
const API_ORIGIN = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

// filePath iliyohifadhiwa database ni njia kamili (absolute path) ya
// kwenye seva (mf. "/opt/render/project/src/uploads/documents/xxx.png"),
// na hiyo njia inatofautiana kutegemea seva/hosting. Badala ya kujaribu
// kukisia muundo mzima wa njia (kama kutafuta "/backend/"), tunachukua
// sehemu inayoanzia "uploads/" pekee — ndiyo njia halisi ambayo backend
// inaitolea (app.use('/uploads', ...)).
const getFileUrl = (doc) => {
  const normalized = (doc.filePath || '').replace(/\\/g, '/');
  const marker = 'uploads/';
  const idx = normalized.indexOf(marker);
  const relativePath = idx !== -1 ? normalized.slice(idx) : `uploads/${normalized.split('/').pop()}`;

  return `${API_ORIGIN}/${relativePath}`;
};

const isImageFile = (fileName = '') => /\.(jpe?g|png|gif|webp)$/i.test(fileName);
const isPdfFile = (fileName = '') => /\.pdf$/i.test(fileName);

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

const typeLabels = {
  barua: 'Letter',
  ripoti: 'Report',
  hati: 'Document',
  nyingine: 'Other',
};

export default function DocumentList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [list, setList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/documents', {
        params: {
          status: statusFilter || undefined,
          documentType: typeFilter || undefined,
          search: search || undefined,
        },
      });

      setList(data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load the list of documents.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.title}"?`)) return;

    setDeletingId(doc.id);
    setError('');

    try {
      await api.delete(`/documents/${doc.id}`);
      setList((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the document.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Documents for Approval
          </h1>

          <p className="text-base text-black mt-1">
            Letters, documents and reports shared for approval.
          </p>
        </div>

        <Link
          to="/documents/upload"
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-base font-medium px-4 py-2 rounded-md"
        >
          + Share New Document
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* SEARCH */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or file name..."
          className="flex-1 border rounded-md px-3 py-2 text-base text-black"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-base text-black"
        >
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-gray-100 hover:bg-gray-200 text-black text-base font-medium px-4 py-2 rounded-md"
        >
          Search
        </button>
      </form>

      {/* STATUS FILTER */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setStatusFilter('')}
          className={`text-base px-3 py-1.5 rounded-md ${
            !statusFilter ? 'bg-[#0B2A4A] text-white' : 'bg-gray-100 text-black'
          }`}
        >
          All
        </button>

        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`text-base px-3 py-1.5 rounded-md ${
              statusFilter === key ? 'bg-[#0B2A4A] text-white' : 'bg-gray-100 text-black'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-base">
          <thead className="bg-gray-50 text-black text-left">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Shared By</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={6}>Loading...</td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={6}>No documents yet.</td>
              </tr>
            ) : (
              list.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-4 py-3 font-semibold text-black">{doc.title}</td>

                  <td className="px-4 py-3 text-black">
                    {typeLabels[doc.documentType] || doc.documentType}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-black text-sm">📎 {doc.fileName}</span>

                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="text-[#0B2A4A] hover:underline text-sm font-semibold whitespace-nowrap"
                        title="View the file"
                      >
                        👁 View
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-black">
                    {doc.uploadedBy?.fullName || '-'}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium px-2 py-1 rounded-md ${statusColors[doc.status]}`}>
                      {statusLabels[doc.status]}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="text-[#0B2A4A] hover:underline text-sm font-semibold whitespace-nowrap"
                      >
                        Open / Approve
                      </Link>

                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(doc)}
                          disabled={deletingId === doc.id}
                          className="text-red-600 hover:underline text-sm font-semibold disabled:text-gray-400 whitespace-nowrap"
                        >
                          {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PREVIEW MODAL */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b">
              <h2 className="text-base font-semibold text-black truncate">
                📎 {previewDoc.fileName}
              </h2>

              <div className="flex items-center gap-4 shrink-0">
                <a
                  href={getFileUrl(previewDoc)}
                  download={previewDoc.fileName}
                  className="text-sm text-[#0B2A4A] hover:underline font-medium"
                >
                  ⬇ Download
                </a>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="text-black text-xl leading-none"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-gray-50">
              {isImageFile(previewDoc.fileName) ? (
                <img
                  src={getFileUrl(previewDoc)}
                  alt={previewDoc.fileName}
                  className="max-w-full max-h-[75vh] object-contain rounded-md"
                />
              ) : isPdfFile(previewDoc.fileName) ? (
                <iframe
                  src={getFileUrl(previewDoc)}
                  title={previewDoc.fileName}
                  className="w-full h-[75vh] rounded-md border-0"
                />
              ) : (
                <p className="text-base text-black text-center py-8">
                  Preview is not available for this file type.
                  Use the Download link above to open it.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
