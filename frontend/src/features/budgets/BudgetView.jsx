import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('sw-TZ', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('sw-TZ', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const formatDateTime = (d) => (d ? new Date(d).toLocaleString('sw-TZ') : '—');

export default function BudgetView() {
  const { id } = useParams();

  const [budget, setBudget] = useState(null);
  const [records, setRecords] = useState([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [recordsError, setRecordsError] = useState('');
  const [recordsLoading, setRecordsLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/budgets/${id}`);
      setBudget(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Imeshindwa kupakia taarifa za bajeti.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    setRecordsLoading(true);
    setRecordsError('');

    try {
      // Matumizi (expenditures) yote yaliyorekodiwa dhidi ya bajeti hii -
      // yanaonyesha kiasi kilichotumika na kwa ajili ya nini (maelezo/ombi).
      const res = await api.get('/expenditures', { params: { budgetId: id } });
      setRecords(res.data);
    } catch (err) {
      setRecordsError(err.response?.data?.message || 'Imeshindwa kupakia rekodi za matumizi.');
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const removeRecord = async (recordId) => {
    if (!confirm('Una uhakika unataka kufuta rekodi hii ya tumizi? Salio la bajeti litarejeshwa.')) return;

    try {
      await api.delete(`/expenditures/${recordId}`);
      await Promise.all([load(), loadRecords()]);
    } catch (err) {
      setRecordsError(err.response?.data?.message || 'Imeshindwa kufuta rekodi.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <p className="text-sm text-gray-500">Inapakia...</p>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error || 'Bajeti haikuonekana.'}
        </div>
        <Link to="/budgets" className="text-sm text-[#0B2A4A] hover:underline">
          &larr; Rudi kwenye Orodha
        </Link>
      </div>
    );
  }

  const allocated = Number(budget.allocatedAmount);
  const spent = Number(budget.spentAmount);
  const remaining = allocated - spent;
  const percent = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
  const recordsTotal = records.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bajeti ya {budget.category?.name || '—'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Mwaka wa Fedha: {budget.fiscalYear}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/budgets/${budget.id}/edit`}
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Hariri Bajeti
          </Link>
          <Link to="/budgets" className="text-sm text-[#0B2A4A] hover:underline">
            &larr; Rudi
          </Link>
        </div>
      </div>

      {/* MUHTASARI WA KIFEDHA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Kilichotengwa</p>
          <p className="text-2xl font-bold text-[#0B2A4A] mt-1">TZS {currency(allocated)}</p>
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Kilichotumika</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">TZS {currency(spent)}</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
            <div
              className={`h-1.5 rounded-full ${percent >= 100 ? 'bg-red-500' : 'bg-[#0B2A4A]'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Salio</p>
          <p className={`text-2xl font-bold mt-1 ${remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
            TZS {currency(remaining)}
          </p>
        </div>
      </div>

      {budget.notes && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Maelezo ya Bajeti</h2>
          <p className="text-sm text-gray-700 border rounded-lg p-4 whitespace-pre-wrap">{budget.notes}</p>
        </div>
      )}

      {/* SEHEMU YA REKODI ZA MATUMIZI - kinachoonyesha kiasi kilichotumika na kwa ajili ya nini */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Rekodi za Matumizi</h2>
            <p className="text-sm text-gray-500 mt-1">
              Kila kiasi kilichotumika katika kategoria ya{' '}
              <span className="font-medium">{budget.category?.name || 'hii'}</span> na kilitumika kwa ajili ya nini.
            </p>
          </div>

          <Link
            to="/expenditures/create"
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md whitespace-nowrap"
          >
            + Rekodi Tumizi Jipya
          </Link>
        </div>

        {recordsError && (
          <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{recordsError}</div>
        )}

        <div className="bg-gray-50 border rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">Idadi ya Rekodi: {records.length}</span>
          <span className="text-sm font-semibold text-gray-800">
            Jumla Iliyorekodiwa: TZS {currency(recordsTotal)}
          </span>
        </div>

        <div className="border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Tarehe</th>
                <th className="px-4 py-3">Kilichonunuliwa / Maelezo</th>
                <th className="px-4 py-3">Ombi (Tracking No.)</th>
                <th className="px-4 py-3">Kiasi</th>
                <th className="px-4 py-3">Aliyerekodi</th>
                <th className="px-4 py-3">Vitendo</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {recordsLoading ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={6}>Inapakia rekodi...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={6}>
                    Hakuna rekodi ya matumizi bado kwenye bajeti hii.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.expenditureDate)}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">
                        {r.description || <span className="text-gray-400">Hakuna maelezo</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Ilirekodiwa: {formatDateTime(r.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/expenditures/${r.id}`}
                        className="text-[#0B2A4A] hover:underline font-medium"
                      >
                        {r.request?.trackingNumber || '—'}
                      </Link>
                      <div className="text-xs text-gray-500">{r.request?.title}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      TZS {currency(r.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.recordedBy?.fullName || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/expenditures/${r.id}`}
                          className="text-gray-600 hover:underline text-xs font-medium"
                        >
                          Angalia
                        </Link>
                        <Link
                          to={`/expenditures/${r.id}/edit`}
                          className="text-[#0B2A4A] hover:underline text-xs font-medium"
                        >
                          Hariri
                        </Link>
                        <button
                          onClick={() => removeRecord(r.id)}
                          className="text-red-600 hover:underline text-xs font-medium"
                        >
                          Futa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
