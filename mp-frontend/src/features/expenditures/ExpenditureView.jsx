import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-US') : '—';

const statusLabels = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

export default function ExpenditureView() {
  const { id } = useParams();

  const [expenditure, setExpenditure] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');

      try {
        const res = await api.get(`/expenditures/${id}`);
        setExpenditure(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load expenditure details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !expenditure) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error || 'Expenditure not found.'}
        </div>
        <Link to="/expenditures" className="text-sm text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>
    );
  }

  const allocated = Number(expenditure.budget?.allocatedAmount || 0);
  const spent = Number(expenditure.budget?.spentAmount || 0);
  const remaining = allocated - spent;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenditure Details</h1>
          <p className="text-sm text-gray-500 mt-1">Expenditure #{expenditure.id}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/expenditures/${expenditure.id}/edit`}
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Edit
          </Link>
          <Link to="/expenditures" className="text-sm text-[#0B2A4A] hover:underline">
            &larr; Back
          </Link>
        </div>
      </div>

      {/* MAIN AMOUNT */}
      <div className="bg-blue-50/40 border border-[#0B2A4A]/20 rounded-xl p-5 mb-6">
        <p className="text-sm text-gray-500">Amount Spent</p>
        <p className="text-3xl font-bold text-[#0B2A4A] mt-1">TZS {currency(expenditure.amount)}</p>
        <p className="text-sm text-gray-500 mt-1">Expenditure Date: {formatDate(expenditure.expenditureDate)}</p>
      </div>

      {/* REQUEST */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Related Request</h2>
        <div className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Tracking Number</p>
            <p className="font-medium text-gray-800">{expenditure.request?.trackingNumber || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Request Status</p>
            <p className="font-medium text-gray-800">
              {statusLabels[expenditure.request?.status] || expenditure.request?.status || '—'}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-gray-500">Request Title</p>
            <p className="font-medium text-gray-800">{expenditure.request?.title || '—'}</p>
          </div>
        </div>
      </div>

      {/* BUDGET */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Budget Used</h2>
        <div className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Category</p>
            <p className="font-medium text-gray-800">{expenditure.budget?.category?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Fiscal Year</p>
            <p className="font-medium text-gray-800">{expenditure.budget?.fiscalYear || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Current Budget Balance</p>
            <p className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
              TZS {currency(remaining)}
            </p>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      {expenditure.description && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
          <p className="text-sm text-gray-700 border rounded-lg p-4 whitespace-pre-wrap">
            {expenditure.description}
          </p>
        </div>
      )}

      {/* METADATA */}
      <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">Recorded By</p>
          <p className="font-medium text-gray-800">{expenditure.recordedBy?.fullName || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Recorded At</p>
          <p className="font-medium text-gray-800">{formatDateTime(expenditure.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
