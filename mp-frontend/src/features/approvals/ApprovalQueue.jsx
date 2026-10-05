import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import api from '../../api/axios';
import { ErrorBanner, ListCard, ListHeader } from '../../components/ListUI.jsx';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '-';

// Page listing every application that is waiting for MY decision.
export default function ApprovalQueue() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/approvals/pending');
        setRows(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load pending approvals.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const th = 'text-left text-[12px] font-bold uppercase tracking-wide text-gray-600 px-3 py-2 border-b border-gray-200 bg-gray-50';
  const td = 'px-3 py-2 text-[14px] text-gray-900 border-b border-gray-200';

  return (
    <ListCard>
      <ListHeader
        title="Pending approvals"
        subtitle="Applications waiting for your decision"
      />

      <ErrorBanner>{error}</ErrorBanner>

      {loading ? (
        <p className="text-[14px] text-gray-500 py-6 text-center">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-[14px] text-gray-500 py-6 text-center">
          Nothing is waiting for you.
        </p>
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
              {rows.map((r) => (
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
      )}
    </ListCard>
  );
}
