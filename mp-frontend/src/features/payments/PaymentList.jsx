import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck, CircleX, Eye, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import {
  ActionsCell,
  EmptyRow,
  ErrorBanner,
  FilterBar,
  IconAction,
  ListCard,
  ListHeader,
  Pagination,
  SummaryBox,
  SummaryGrid,
  TableWrap,
  Td,
  Th,
  inputClass,
} from '../../components/ListUI.jsx';

const PAGE_SIZE = 10;

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US') : '—');

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const statusDots = {
  pending: 'bg-amber-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
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
  const [page, setPage] = useState(1);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');

      try {
        const params = filterStatus ? { status: filterStatus } : {};
        const res = await api.get('/payments', { params });
        if (!cancelled) setList(res.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to fetch the list of payments.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filterStatus, reloadKey]);

  const quickStatus = async (id, status) => {
    setBusyId(id);
    setError('');

    try {
      await api.patch(`/payments/${id}/status`, { status });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the payment status.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;

    setBusyId(id);
    setError('');

    try {
      await api.delete(`/payments/${id}`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the payment.');
    } finally {
      setBusyId(null);
    }
  };

  const totalAmount = list.reduce((sum, p) => sum + Number(p.amount), 0);

  const lastPage = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const rows = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <ListCard>
      <ListHeader
        title="Payments"
        subtitle={`${list.length} recorded`}
        actionTo="/payments/create"
        actionLabel="Record New Payment"
      />

      <ErrorBanner>{error}</ErrorBanner>

      <SummaryGrid>
        <SummaryBox label="Total payments shown" value={`TZS ${currency(totalAmount)}`} />
      </SummaryGrid>

      <FilterBar>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className={`${inputClass} pr-8`}
        >
          <option value="">All statuses</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </FilterBar>

      <TableWrap>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Request</Th>
            <Th>Payee</Th>
            <Th>Method</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <EmptyRow colSpan={7}>Loading...</EmptyRow>
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={7}>No payments found.</EmptyRow>
          ) : (
            rows.map((p) => (
              <tr key={p.id}>
                <Td className="whitespace-nowrap">{formatDate(p.paymentDate)}</Td>

                <Td left>
                  <Link to={`/payments/${p.id}`} className="font-semibold text-gray-900 hover:text-[#0b6e4f] hover:underline">
                    {p.expenditure?.request?.trackingNumber || '—'}
                  </Link>
                  {p.expenditure?.budget && (
                    <div className="text-[13px] text-gray-500">
                      {p.expenditure.budget.category?.name} — {p.expenditure.budget.fiscalYear}
                    </div>
                  )}
                </Td>

                <Td>
                  {p.payeeName}
                  {p.payeePhone && <div className="text-[13px] text-gray-500">{p.payeePhone}</div>}
                </Td>

                <Td>{methodLabels[p.paymentMethod] || p.paymentMethod}</Td>
                <Td className="whitespace-nowrap font-semibold">TZS {currency(p.amount)}</Td>

                <Td>
                  <span
                    className={`inline-flex items-center gap-2 text-[13px] font-medium px-2.5 py-1.5 rounded-md ${
                      statusStyles[p.status] || ''
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusDots[p.status] || 'bg-gray-400'}`} />
                    {statusLabels[p.status] || p.status}
                  </span>
                </Td>

                <Td>
                  <ActionsCell>
                    <IconAction variant="view" title="View" to={`/payments/${p.id}`}>
                      <Eye size={16} />
                    </IconAction>
                    <IconAction variant="edit" title="Edit" to={`/payments/${p.id}/edit`}>
                      <Pencil size={16} />
                    </IconAction>

                    {p.status === 'pending' && (
                      <>
                        <IconAction
                          variant="success"
                          title="Mark as completed"
                          disabled={busyId === p.id}
                          onClick={() => quickStatus(p.id, 'completed')}
                        >
                          <CircleCheck size={16} />
                        </IconAction>
                        <IconAction
                          variant="danger"
                          title="Mark as failed"
                          disabled={busyId === p.id}
                          onClick={() => quickStatus(p.id, 'failed')}
                        >
                          <CircleX size={16} />
                        </IconAction>
                      </>
                    )}

                    <IconAction
                      variant="danger"
                      title="Delete"
                      disabled={busyId === p.id}
                      onClick={() => remove(p.id)}
                    >
                      <Trash2 size={16} />
                    </IconAction>
                  </ActionsCell>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>

      <Pagination page={currentPage} pageSize={PAGE_SIZE} total={list.length} onChange={setPage} />
    </ListCard>
  );
}
