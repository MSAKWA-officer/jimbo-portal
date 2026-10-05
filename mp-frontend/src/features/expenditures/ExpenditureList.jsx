import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
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

export default function ExpenditureList() {
  const [list, setList] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const [page, setPage] = useState(1);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Pakia orodha (mwaka wa fedha unachelewa 300ms)
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const params = filterYear.trim() ? { fiscalYear: filterYear.trim() } : {};
        const res = await api.get('/expenditures', { params });
        if (!cancelled) setList(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to fetch the list of expenditures.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filterYear, reloadKey]);

  const remove = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this expenditure? The related budget balance will be restored.'
      )
    ) {
      return;
    }

    setDeletingId(id);
    setError('');

    try {
      await api.delete(`/expenditures/${id}`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the expenditure.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalAmount = list.reduce((sum, e) => sum + Number(e.amount), 0);

  const lastPage = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const rows = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <ListCard>
      <ListHeader
        title="Expenditures"
        subtitle={`${list.length} recorded`}
        actionTo="/expenditures/create"
        actionLabel="Record New Expenditure"
      />

      <ErrorBanner>{error}</ErrorBanner>

      <SummaryGrid>
        <SummaryBox label="Total expenditures shown" value={`TZS ${currency(totalAmount)}`} />
      </SummaryGrid>

      <FilterBar>
        <input
          placeholder="Filter by fiscal year (e.g. 2025/2026)"
          className={`${inputClass} w-full sm:w-[320px]`}
          value={filterYear}
          onChange={(e) => {
            setFilterYear(e.target.value);
            setPage(1);
          }}
        />
      </FilterBar>

      <TableWrap>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Request (tracking no.)</Th>
            <Th>Category</Th>
            <Th>Fiscal year</Th>
            <Th>Amount</Th>
            <Th>Recorded by</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <EmptyRow colSpan={7}>Loading...</EmptyRow>
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={7}>No expenditures found.</EmptyRow>
          ) : (
            rows.map((e) => (
              <tr key={e.id}>
                <Td className="whitespace-nowrap">{formatDate(e.expenditureDate)}</Td>

                <Td left>
                  <Link to={`/expenditures/${e.id}`} className="font-semibold text-gray-900 hover:text-[#0b6e4f] hover:underline">
                    {e.request?.trackingNumber || '—'}
                  </Link>
                  {e.request?.title && <div className="text-[13px] text-gray-500">{e.request.title}</div>}
                </Td>

                <Td>{e.budget?.category?.name || '—'}</Td>
                <Td>{e.budget?.fiscalYear || '—'}</Td>
                <Td className="whitespace-nowrap font-semibold">TZS {currency(e.amount)}</Td>
                <Td>{e.recordedBy?.fullName || '—'}</Td>

                <Td>
                  <ActionsCell>
                    <IconAction variant="view" title="View" to={`/expenditures/${e.id}`}>
                      <Eye size={16} />
                    </IconAction>
                    <IconAction variant="edit" title="Edit" to={`/expenditures/${e.id}/edit`}>
                      <Pencil size={16} />
                    </IconAction>
                    <IconAction
                      variant="danger"
                      title={deletingId === e.id ? 'Deleting...' : 'Delete'}
                      disabled={deletingId === e.id}
                      onClick={() => remove(e.id)}
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
