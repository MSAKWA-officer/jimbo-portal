import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const statusLabels = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-200 text-gray-800',
};

// ---------------------------------------------------------------
// Letter viewer (modal)
// Loads the letter through the API (GET /requests/:id/letter) so the
// login token is sent and the file path on the server does not matter.
// ---------------------------------------------------------------
const readError = async (err, fallback) => {
  const data = err.response?.data;
  try {
    if (data instanceof Blob) {
      const parsed = JSON.parse(await data.text());
      return parsed.message || fallback;
    }
  } catch {
    /* ignore */
  }
  return data?.message || fallback;
};

function LetterViewer({ letter, onClose }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [kind, setKind] = useState('pdf'); // pdf | image | other
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let url = '';
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get(`/requests/${letter.requestId}/letter`, {
          responseType: 'blob',
        });
        if (cancelled) return;

        const type = res.data.type || '';
        const ext = String(letter.name || '').split('.').pop().toLowerCase();
        if (type.includes('pdf') || ext === 'pdf') setKind('pdf');
        else if (type.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(ext)) setKind('image');
        else setKind('other');

        url = URL.createObjectURL(res.data);
        setBlobUrl(url);
      } catch (err) {
        if (!cancelled) setError(await readError(err, 'Failed to load the letter.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [letter.requestId, letter.name]);

  // Close with Esc + lock page scroll while open
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Identification letter"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b">
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">{letter.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {letter.trackingNumber} · {letter.title}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {blobUrl && (
              <>
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Open in new tab
                </a>
                <a
                  href={blobUrl}
                  download={letter.name}
                  className="text-xs font-medium px-3 py-1.5 rounded-md bg-[#0B2A4A] hover:bg-[#123B63] text-white"
                >
                  Download
                </a>
              </>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="relative flex-1 bg-gray-100">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
              Loading letter...
            </div>
          )}

          {error && (
            <div className="h-full flex items-center justify-center p-6">
              <div className="max-w-md text-center bg-red-50 text-red-700 text-sm px-4 py-3 rounded-md">
                {error}
              </div>
            </div>
          )}

          {!error && blobUrl && kind === 'pdf' && (
            <iframe title={letter.name} src={blobUrl} className="w-full h-full border-0" />
          )}

          {!error && blobUrl && kind === 'image' && (
            <div className="w-full h-full overflow-auto flex items-start justify-center p-4">
              <img src={blobUrl} alt={letter.name} className="max-w-full h-auto rounded shadow" />
            </div>
          )}

          {!error && blobUrl && kind === 'other' && (
            <div className="h-full flex items-center justify-center text-sm text-gray-600">
              This file type cannot be previewed. Use Download instead.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApplicationList() {
  const [list, setList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewLetter, setViewLetter] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/requests', {
        params: {
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });

      setList(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load the applications list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/requests/${id}/status`, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the application status.');
    }
  };

  const openLetter = (r) =>
    setViewLetter({
      requestId: r.id,
      name: r.identificationLetterName,
      trackingNumber: r.trackingNumber,
      title: r.title,
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete list of all submitted applications.
          </p>
        </div>

        <Link
          to="/applications/create"
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + New Application
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* SEARCH */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or tracking number..."
          className="flex-1 border rounded-md px-3 py-2 text-sm"
        />

        <button
          type="submit"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-md"
        >
          Search
        </button>
      </form>

      {/* STATUS FILTER */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setStatusFilter('')}
          className={`text-sm px-3 py-1.5 rounded-md ${
            !statusFilter ? 'bg-[#0B2A4A] text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          All
        </button>

        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`text-sm px-3 py-1.5 rounded-md ${
              statusFilter === key ? 'bg-[#0B2A4A] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3">Tracking No.</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Constituent</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Letter</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={7}>
                  Loading...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={7}>
                  No applications yet.
                </td>
              </tr>
            ) : (
              list.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.trackingNumber}</td>

                  <td className="px-4 py-3 font-medium text-gray-800">{r.title}</td>

                  <td className="px-4 py-3 text-gray-600">{r.constituent?.fullName || '-'}</td>

                  <td className="px-4 py-3 text-gray-600">{r.category?.name || '-'}</td>

                  <td className="px-4 py-3">
                    {r.identificationLetterName ? (
                      <button
                        type="button"
                        onClick={() => openLetter(r)}
                        title={r.identificationLetterName}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                      </button>
                    ) : (
                      <span className="text-red-600 text-xs">None</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => changeStatus(r.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-md border-0 ${statusColors[r.status]}`}
                    >
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      to={`/applications/${r.id}/edit`}
                      className="text-[#0B2A4A] hover:underline text-xs font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewLetter && <LetterViewer letter={viewLetter} onClose={() => setViewLetter(null)} />}
    </div>
  );
}
