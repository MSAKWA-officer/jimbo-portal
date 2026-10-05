import { useEffect, useState } from 'react';
import { Download, ExternalLink, Eye, Paperclip, Trash2, X } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  ActionsCell,
  EmptyRow,
  ErrorBanner,
  FilterBar,
  IconAction,
  ListCard,
  ListHeader,
  Pagination,
  TableWrap,
  Td,
  Th,
  inputClass,
} from '../../components/ListUI.jsx';

const PAGE_SIZE = 10;

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

const statusDots = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
};

const typeLabels = {
  barua: 'Letter',
  ripoti: 'Report',
  hati: 'Document',
  nyingine: 'Other',
};

const isImageFile = (fileName = '') => /\.(jpe?g|png|gif|webp)$/i.test(fileName);
const isPdfFile = (fileName = '') => /\.pdf$/i.test(fileName);

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

// ---------------------------------------------------------------
// File viewer (modal)
// Inapakia faili kupitia API (GET /documents/:id/file) ili token ya
// login itumwe na njia ya faili kwenye server isihitajike.
// ---------------------------------------------------------------
function FileViewer({ doc, onClose }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let url = '';
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get(`/documents/${doc.id}/file`, { responseType: 'blob' });
        if (cancelled) return;
        url = URL.createObjectURL(res.data);
        setBlobUrl(url);
      } catch (err) {
        if (!cancelled) setError(await readError(err, 'Failed to load the file.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [doc.id]);

  // Funga kwa Esc + zuia scroll ya ukurasa wakati modal iko wazi
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
      aria-label="Document file"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-gray-200">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{doc.fileName}</p>
            <p className="text-xs text-gray-500 truncate">{doc.title}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {blobUrl && (
              <>
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  <ExternalLink size={14} />
                  Open in new tab
                </a>
                <a
                  href={blobUrl}
                  download={doc.fileName}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-[#0b6e4f] hover:bg-[#095a41] text-white"
                >
                  <Download size={14} />
                  Download
                </a>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="relative flex-1 min-h-0 bg-gray-100">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
              Loading file...
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="max-w-md text-center bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          {!error && blobUrl && isPdfFile(doc.fileName) && (
            <iframe title={doc.fileName} src={blobUrl} className="absolute inset-0 w-full h-full border-0" />
          )}

          {!error && blobUrl && isImageFile(doc.fileName) && (
            <div className="absolute inset-0 overflow-auto flex items-start justify-center p-4">
              <img src={blobUrl} alt={doc.fileName} className="max-w-full h-auto rounded shadow" />
            </div>
          )}

          {!error && blobUrl && !isPdfFile(doc.fileName) && !isImageFile(doc.fileName) && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-sm text-gray-600 text-center">
              Preview is not available for this file type. Use Download to open it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Pakia orodha (search inachelewa 300ms)
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/documents', {
          params: {
            status: statusFilter || undefined,
            documentType: typeFilter || undefined,
            search: search || undefined,
            page,
            limit: PAGE_SIZE,
          },
        });
        if (cancelled) return;
        setList(data.data);
        setTotal(data.total ?? data.data.length);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load the list of documents.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, statusFilter, typeFilter, page, reloadKey]);

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.title}"?`)) return;

    setDeletingId(doc.id);
    setError('');

    try {
      await api.delete(`/documents/${doc.id}`);
      // Kama ulifuta mwisho wa ukurasa, rudi ukurasa uliotangulia
      if (list.length === 1 && page > 1) setPage(page - 1);
      else setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the document.');
    } finally {
      setDeletingId(null);
    }
  };

  const selectClass = `${inputClass} pr-8`;

  return (
    <ListCard>
      <ListHeader
        title="Documents for Approval"
        subtitle={`${total} documents`}
        actionTo="/documents/upload"
        actionLabel="Share New Document"
      />

      <ErrorBanner>{error}</ErrorBanner>

      {/* FILTERS */}
      <FilterBar>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search title or file name"
          className={`${inputClass} w-full sm:w-[300px]`}
        />

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">All types</option>
          {Object.entries(typeLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </FilterBar>

      {/* TABLE */}
      <TableWrap>
        <thead>
          <tr>
            <Th>Title</Th>
            <Th>Type</Th>
            <Th>File</Th>
            <Th>Shared by</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <EmptyRow colSpan={6}>Loading...</EmptyRow>
          ) : list.length === 0 ? (
            <EmptyRow colSpan={6}>No documents found.</EmptyRow>
          ) : (
            list.map((doc) => (
              <tr key={doc.id}>
                <Td left className="font-semibold">{doc.title}</Td>

                <Td>{typeLabels[doc.documentType] || doc.documentType}</Td>

                <Td>
                  {doc.fileName ? (
                    <button
                      type="button"
                      onClick={() => setViewDoc(doc)}
                      title={`Open ${doc.fileName}`}
                      className="inline-flex items-center gap-1.5 text-green-700 font-medium hover:text-green-900 hover:underline"
                    >
                      <Paperclip size={14} />
                      Attached
                    </button>
                  ) : (
                    <span className="text-red-600">None</span>
                  )}
                </Td>

                <Td>{doc.uploadedBy?.fullName || '-'}</Td>

                <Td>
                  <span
                    className={`inline-flex items-center gap-2 text-[13px] font-medium px-2.5 py-1.5 rounded-md ${
                      statusColors[doc.status] || ''
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusDots[doc.status] || 'bg-gray-400'}`} />
                    {statusLabels[doc.status] || doc.status}
                  </span>
                </Td>

                <Td>
                  <ActionsCell>
                    <IconAction variant="view" title="Open / Approve" to={`/documents/${doc.id}`}>
                      <Eye size={16} />
                    </IconAction>

                    {isAdmin && (
                      <IconAction
                        variant="danger"
                        title={deletingId === doc.id ? 'Deleting...' : 'Delete'}
                        disabled={deletingId === doc.id}
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 size={16} />
                      </IconAction>
                    )}
                  </ActionsCell>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />

      {viewDoc && <FileViewer doc={viewDoc} onClose={() => setViewDoc(null)} />}
    </ListCard>
  );
}
