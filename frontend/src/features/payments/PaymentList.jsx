import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US') : '—');

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-black',
};

const statusLabels = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

const methodLabels = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  cheque: 'Cheque',
};

export default function PaymentList() {
  const [list, setList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (statusFilter = filterStatus) => {
    setLoading(true);
    setError('');

    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.get('/payments', { params });
      setList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch the list of payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (statusFilter) => {
    setFilterStatus(statusFilter);
    load(statusFilter);
  };

  const quickStatus = async (id, status) => {
    try {
      await api.patch(`/payments/${id}/status`, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the payment status.');
    }
  };

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      await api.delete(`/payments/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the payment.');
    }
  };

  const totalAmount = list.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Payments</h1>
        
        </div>

        <Link
          to="/payments/create"
          className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + Record New Payment
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {/* SUMMARY */}
      <div className="bg-white border rounded-xl p-5 shadow-sm mb-6 max-w-xs">
        <p className="text-sm text-black">Total Payments Shown</p>
        <p className="text-2xl font-bold text-black mt-1">TZS {currency(totalAmount)}</p>
      </div>

      {/* STATUS FILTER */}
      <div className="flex items-center gap-2 mb-4">
        {['', 'pending', 'completed', 'failed', 'cancelled'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => handleFilter(s)}
            className={`text-sm px-3 py-1.5 rounded-md font-medium ${
              filterStatus === s
                ? 'bg-[#0B2A4A] text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            {s ? statusLabels[s] : 'All'}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-black text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Request</th>
              <th className="px-4 py-3">Payee</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={7}>Loading...</td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-black" colSpan={7}>No payments recorded yet.</td>
              </tr>
            ) : (
              list.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-black">{formatDate(p.paymentDate)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/payments/${p.id}`} className="text-black hover:underline font-medium">
                      {p.expenditure?.request?.trackingNumber || '—'}
                    </Link>
                    <div className="text-xs text-black">
                      {p.expenditure?.budget?.category?.name} — {p.expenditure?.budget?.fiscalYear}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-black">
                    {p.payeeName}
                    {p.payeePhone && <div className="text-xs text-black">{p.payeePhone}</div>}
                  </td>
                  <td className="px-4 py-3 text-black">{methodLabels[p.paymentMethod] || p.paymentMethod}</td>
                  <td className="px-4 py-3 font-medium text-black">TZS {currency(p.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[p.status]}`}>
                      {statusLabels[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link to={`/payments/${p.id}`} className="text-black hover:underline text-xs font-medium">
                        View
                      </Link>
                      <Link to={`/payments/${p.id}/edit`} className="text-black hover:underline text-xs font-medium">
                        Edit
                      </Link>
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => quickStatus(p.id, 'completed')}
                            className="text-green-700 hover:underline text-xs font-medium"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => quickStatus(p.id, 'failed')}
                            className="text-red-600 hover:underline text-xs font-medium"
                          >
                            Failed
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => remove(p.id)}
                        className="text-red-600 hover:underline text-xs font-medium"
                      >
                        Delete
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
  );
}
