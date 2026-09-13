import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const formatDateTime = (d) => (d ? new Date(d).toLocaleString('en-US') : '—');

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

export default function PaymentView() {
  const { id } = useParams();

  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');

      try {
        const res = await api.get(`/payments/${id}`);
        setPayment(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load the payment details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <p className="text-sm text-black">Loading...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error || 'Payment not found.'}
        </div>
        <Link to="/payments" className="text-sm text-black hover:underline">
          &larr; Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Payment Details</h1>
          <p className="text-sm text-black mt-1">Payment #{payment.id}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/payments/${payment.id}/edit`}
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Edit
          </Link>
          <Link to="/payments" className="text-sm text-black hover:underline">
            &larr; Back
          </Link>
        </div>
      </div>

      {/* MAIN AMOUNT */}
      <div className="bg-blue-50/40 border border-[#0B2A4A]/20 rounded-xl p-5 mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-black">Amount Paid</p>
          <p className="text-3xl font-bold text-black mt-1">TZS {currency(payment.amount)}</p>
          <p className="text-sm text-black mt-1">Date: {formatDate(payment.paymentDate)}</p>
        </div>
        <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${statusStyles[payment.status]}`}>
          {statusLabels[payment.status]}
        </span>
      </div>

      {/* PAYEE */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-black mb-2">Payee</h2>
        <div className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-black">Name</p>
            <p className="font-medium text-black">{payment.payeeName}</p>
          </div>
          <div>
            <p className="text-xs text-black">Phone</p>
            <p className="font-medium text-black">{payment.payeePhone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-black">Payment Method</p>
            <p className="font-medium text-black">{methodLabels[payment.paymentMethod]}</p>
          </div>
        </div>
      </div>

      {/* RELATED EXPENDITURE / REQUEST */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-black mb-2">Related Expenditure and Request</h2>
        <div className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-black">Request Tracking Number</p>
            <p className="font-medium text-black">{payment.expenditure?.request?.trackingNumber || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-black">Total Expenditure Amount</p>
            <p className="font-medium text-black">TZS {currency(payment.expenditure?.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-black">Category</p>
            <p className="font-medium text-black">{payment.expenditure?.budget?.category?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-black">Fiscal Year</p>
            <p className="font-medium text-black">{payment.expenditure?.budget?.fiscalYear || '—'}</p>
          </div>
        </div>
      </div>

      {/* REFERENCE NUMBER */}
      {payment.referenceNumber && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-black mb-2">Reference Number</h2>
          <p className="text-sm text-black border rounded-lg p-4">{payment.referenceNumber}</p>
        </div>
      )}

      {/* NOTES */}
      {payment.notes && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-black mb-2">Notes</h2>
          <p className="text-sm text-black border rounded-lg p-4 whitespace-pre-wrap">{payment.notes}</p>
        </div>
      )}

      {/* METADATA */}
      <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-black">Recorded By</p>
          <p className="font-medium text-black">{payment.recordedBy?.fullName || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-black">Recorded On</p>
          <p className="font-medium text-black">{formatDateTime(payment.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
