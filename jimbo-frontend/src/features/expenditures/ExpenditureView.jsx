import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('sw-TZ', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('sw-TZ', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('sw-TZ') : '—';

const statusLabels = {
  pending: 'Inasubiri',
  in_review: 'Inapitiwa',
  approved: 'Imeidhinishwa',
  rejected: 'Imekataliwa',
  completed: 'Imekamilika',
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
        setError(err.response?.data?.message || 'Imeshindwa kupakia taarifa za tumizi.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <p className="text-sm text-gray-500">Inapakia...</p>
      </div>
    );
  }

  if (error || !expenditure) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error || 'Tumizi halikuonekana.'}
        </div>
        <Link to="/expenditures" className="text-sm text-[#0B2A4A] hover:underline">
          &larr; Rudi kwenye Orodha
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
          <h1 className="text-2xl font-bold text-gray-800">Taarifa za Tumizi</h1>
          <p className="text-sm text-gray-500 mt-1">Tumizi #{expenditure.id}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/expenditures/${expenditure.id}/edit`}
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Hariri
          </Link>
          <Link to="/expenditures" className="text-sm text-[#0B2A4A] hover:underline">
            &larr; Rudi
          </Link>
        </div>
      </div>

      {/* KIASI KIKUU */}
      <div className="bg-blue-50/40 border border-[#0B2A4A]/20 rounded-xl p-5 mb-6">
        <p className="text-sm text-gray-500">Kiasi Kilichotumika</p>
        <p className="text-3xl font-bold text-[#0B2A4A] mt-1">TZS {currency(expenditure.amount)}</p>
        <p className="text-sm text-gray-500 mt-1">Tarehe ya Matumizi: {formatDate(expenditure.expenditureDate)}</p>
      </div>

      {/* OMBI */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Ombi Husika</h2>
        <div className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Namba ya Ufuatiliaji</p>
            <p className="font-medium text-gray-800">{expenditure.request?.trackingNumber || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Hali ya Ombi</p>
            <p className="font-medium text-gray-800">
              {statusLabels[expenditure.request?.status] || expenditure.request?.status || '—'}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-gray-500">Kichwa cha Ombi</p>
            <p className="font-medium text-gray-800">{expenditure.request?.title || '—'}</p>
          </div>
        </div>
      </div>

      {/* BAJETI */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Bajeti Iliyotumika</h2>
        <div className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Kategoria</p>
            <p className="font-medium text-gray-800">{expenditure.budget?.category?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Mwaka wa Fedha</p>
            <p className="font-medium text-gray-800">{expenditure.budget?.fiscalYear || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Salio la Sasa la Bajeti</p>
            <p className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
              TZS {currency(remaining)}
            </p>
          </div>
        </div>
      </div>

      {/* MAELEZO */}
      {expenditure.description && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Maelezo</h2>
          <p className="text-sm text-gray-700 border rounded-lg p-4 whitespace-pre-wrap">
            {expenditure.description}
          </p>
        </div>
      )}

      {/* METADATA */}
      <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">Aliyerekodi</p>
          <p className="font-medium text-gray-800">{expenditure.recordedBy?.fullName || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Ilirekodiwa</p>
          <p className="font-medium text-gray-800">{formatDateTime(expenditure.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
