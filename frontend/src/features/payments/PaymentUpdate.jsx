import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const statusLabels = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export default function PaymentUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);

  const [form, setForm] = useState({
    payeeName: '',
    payeePhone: '',
    amount: '',
    paymentMethod: 'bank_transfer',
    referenceNumber: '',
    paymentDate: '',
    notes: '',
  });

  const [statusValue, setStatusValue] = useState('pending');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/payments/${id}`);
      const p = res.data;

      setPayment(p);
      setStatusValue(p.status);
      setForm({
        payeeName: p.payeeName || '',
        payeePhone: p.payeePhone || '',
        amount: p.amount ?? '',
        paymentMethod: p.paymentMethod || 'bank_transfer',
        referenceNumber: p.referenceNumber || '',
        paymentDate: p.paymentDate ? p.paymentDate.slice(0, 10) : '',
        notes: p.notes || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load the payment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.put(`/payments/${id}`, {
        payeeName: form.payeeName,
        payeePhone: form.payeePhone || undefined,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        referenceNumber: form.referenceNumber || undefined,
        paymentDate: form.paymentDate,
        notes: form.notes || undefined,
      });

      navigate('/payments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusSave = async () => {
    setError('');
    setSavingStatus(true);

    try {
      await api.patch(`/payments/${id}/status`, { status: statusValue });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the payment status.');
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Edit Payment</h1>

        <Link to="/payments" className="text-sm text-black hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-black">Loading...</p>
      ) : (
        <>
          {/* EXPENDITURE INFO (READ ONLY) */}
          <div className="border rounded-lg p-4 bg-gray-50 mb-6 text-sm">
            <p className="text-xs text-black">Related Expenditure</p>
            <p className="font-medium text-black">
              {payment?.expenditure?.request?.trackingNumber} — TZS {currency(payment?.expenditure?.amount)}
            </p>
            <p className="text-xs text-black mt-2">
              {payment?.expenditure?.budget?.category?.name} — {payment?.expenditure?.budget?.fiscalYear}
            </p>
          </div>

          {/* PAYMENT STATUS */}
          <div className="border rounded-lg p-4 mb-6 flex items-center gap-3">
            <label className="text-xs font-medium text-black">Payment Status</label>
            <select
              className="border rounded-md px-3 py-1.5 text-sm text-black"
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              onClick={handleStatusSave}
              disabled={savingStatus || statusValue === payment?.status}
              className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-300 text-white text-xs font-medium px-3 py-1.5 rounded-md"
            >
              {savingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          {/* DETAILS FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Payee Name"
                required
                className="border rounded-md px-3 py-2 text-sm text-black"
                value={form.payeeName}
                onChange={(e) => setForm({ ...form, payeeName: e.target.value })}
              />
              <input
                placeholder="Payee Phone Number (optional)"
                className="border rounded-md px-3 py-2 text-sm text-black"
                value={form.payeePhone}
                onChange={(e) => setForm({ ...form, payeePhone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount (TZS)"
                required
                className="border rounded-md px-3 py-2 text-sm text-black"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <input
                type="date"
                required
                className="border rounded-md px-3 py-2 text-sm text-black"
                value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                className="border rounded-md px-3 py-2 text-sm text-black"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>

              <input
                placeholder="Reference Number (optional)"
                className="border rounded-md px-3 py-2 text-sm text-black"
                value={form.referenceNumber}
                onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
              />
            </div>

            <textarea
              placeholder="Notes (optional)"
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm text-black"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-sm font-medium px-5 py-2.5 rounded-md"
              >
                {submitting ? 'Updating...' : 'Save Changes'}
              </button>

              <Link
                to="/payments"
                className="bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium px-5 py-2.5 rounded-md"
              >
                Cancel
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
