import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import api from '../../api/axios';
import { ErrorBanner, ListCard, ListHeader } from '../../components/ListUI.jsx';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '-';

const th = 'text-left text-[12px] font-bold uppercase tracking-wide text-gray-600 px-3 py-2 border-b border-gray-200 bg-gray-50';
const td = 'px-3 py-2 text-[14px] text-gray-900 border-b border-gray-200';

// Everything waiting for MY decision (applications + documents).
// Data comes from GET /api/approvals/pending; the backend decides what I may see.
export default function ApprovalQueue() {
  const [tab, setTab] = useState('applications');
  const [apps, setApps] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/approvals/pending');
      setApps(data.applications || []);
      setDocs(data.documents || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending approvals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decideDocument = async (doc, status) => {
    let approvalComment = '';

    if (status === 'rejected') {
      approvalComment = (window.prompt('Reason for rejecting this document (required):') || '').trim();
      if (!approvalComment) return;
    } else if (!window.confirm(`Approve "${doc.title}"?`)) {
      return;
    }

    setBusyId(doc.id);
    setError('');
    try {
      await api.patch(`/documents/${doc.id}/status`, { status, approvalComment });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save the decision.');
    } finally {
      setBusyId(null);
    }
  };

  const tabClass = (key) =>
    `h-[40px] px-4 rounded-lg text-[14px] font-medium border ${
      tab === key
        ? 'bg-[#0b6e4f] text-white border-[#0b6e4f]'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
    }`;

  return (
    <ListCard>
      <ListHeader title="Pending approvals" subtitle="Items waiting for your decision" />
      <ErrorBanner>{error}</ErrorBanner>

      <div className="flex gap-2 mb-4">
        <button type="button" className={tabClass('applications')} onClick={() => setTab('applications')}>
          Applications ({apps.length})
        </button>
        <button type="button" className={tabClass('documents')} onClick={() => setTab('documents')}>
          Documents ({docs.length})
        </button>
      </div>

      {loading ? (
        <p className="text-[14px] text-gray-500 py-6 text-center">Loading...</p>
      ) : tab === 'applications' ? (
        apps.length === 0 ? (
          <p className="text-[14px] text-gray-500 py-6 text-center">No applications are waiting for you.</p>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Tracking no.</th>
                  <th className={th}>Title</th>
                  <th className={th}>Category</th>
                  <th className={th}>Constituent</th>
                  <th className={th}>Submitted by</th>
                  <th className={th}>Step</th>
                  <th className={th}>Submitted</th>
                  <th className={th}></th>
                </tr>
              </thead>
              <tbody>
                {apps.map((r) => (
                  <tr key={r.id}>
                    <td className={`${td} font-mono`}>{r.request?.trackingNumber}</td>
                    <td className={td}>{r.request?.title}</td>
                    <td className={td}>{r.request?.category?.name || '-'}</td>
                    <td className={td}>{r.request?.constituent?.fullName || '-'}</td>
                    <td className={td}>{r.request?.submittedBy?.fullName || '-'}</td>
                    <td className={td}>{r.stepName}</td>
                    <td className={td}>{formatDate(r.request?.submittedAt)}</td>
                    <td className={td}>
                      <Link
                        to={`/applications/${r.requestId}`}
                        className="inline-flex items-center gap-1 text-blue-700 hover:underline text-[14px]"
                      >
                        <Eye size={16} /> Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : docs.length === 0 ? (
        <p className="text-[14px] text-gray-500 py-6 text-center">
          No documents are waiting for you. Only admins can approve documents.
        </p>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Title</th>
                <th className={th}>Type</th>
                <th className={th}>Shared by</th>
                <th className={th}>Submitted</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td className={td}>{d.title}</td>
                  <td className={`${td} capitalize`}>{d.documentType}</td>
                  <td className={td}>{d.uploadedBy?.fullName || '-'}</td>
                  <td className={td}>{formatDate(d.submittedAt || d.createdAt)}</td>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <Link to={`/documents/${d.id}`} className="inline-flex items-center gap-1 text-blue-700 hover:underline text-[14px]">
                        <Eye size={16} /> View
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === d.id}
                        onClick={() => decideDocument(d, 'approved')}
                        className="text-[13px] font-medium px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === d.id}
                        onClick={() => decideDocument(d, 'rejected')}
                        className="text-[13px] font-medium px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ListCard>
  );
}
