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

export default function BudgetList() {
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
        const res = await api.get('/budgets', { params });
        if (!cancelled) setList(res.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to fetch the list of budgets.');
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
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    setDeletingId(id);
    setError('');

    try {
      await api.delete(`/budgets/${id}`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the budget.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalAllocated = list.reduce((sum, b) => sum + Number(b.allocatedAmount), 0);
  const totalSpent = list.reduce((sum, b) => sum + Number(b.spentAmount || 0), 0);
  const balance = totalAllocated - totalSpent;

  const lastPage = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const rows = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <ListCard>
      <ListHeader
        title="Budgets"
        subtitle={`${list.length} registered`}
        actionTo="/budgets/create"
        actionLabel="Allocate New Budget"
      />

      <ErrorBanner>{error}</ErrorBanner>

      <SummaryGrid>
        <SummaryBox label="Total allocated" value={`TZS ${currency(totalAllocated)}`} />
        <SummaryBox label="Total spent" value={`TZS ${currency(totalSpent)}`} />
        <SummaryBox
          label="Balance"
          value={`TZS ${currency(balance)}`}
          tone={balance < 0 ? 'danger' : 'success'}
        />
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
            <Th>Category</Th>
            <Th>Fiscal year</Th>
            <Th>Allocated</Th>
            <Th>Spent</Th>
            <Th>Balance</Th>
            <Th>Created by</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <EmptyRow colSpan={7}>Loading...</EmptyRow>
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={7}>No budgets found.</EmptyRow>
          ) : (
            rows.map((b) => {
              const allocated = Number(b.allocatedAmount);
              const spent = Number(b.spentAmount || 0);
              const remaining = allocated - spent;

              return (
                <tr key={b.id}>
                  <Td left>
                    <Link to={`/budgets/${b.id}`} className="font-semibold text-gray-900 hover:text-[#0b6e4f] hover:underline">
                      {b.category?.name || '—'}
                    </Link>
                  </Td>
                  <Td>{b.fiscalYear}</Td>
                  <Td className="whitespace-nowrap">TZS {currency(allocated)}</Td>
                  <Td className="whitespace-nowrap">TZS {currency(spent)}</Td>
                  <Td
                    className={`whitespace-nowrap font-semibold ${
                      remaining < 0 ? 'text-red-600' : 'text-green-700'
                    }`}
                  >
                    TZS {currency(remaining)}
                  </Td>
                  <Td>{b.createdBy?.fullName || '—'}</Td>
                  <Td>
                    <ActionsCell>
                      <IconAction variant="view" title="View" to={`/budgets/${b.id}`}>
                        <Eye size={16} />
                      </IconAction>
                      <IconAction variant="edit" title="Edit" to={`/budgets/${b.id}/edit`}>
                        <Pencil size={16} />
                      </IconAction>
                      <IconAction
                        variant="danger"
                        title={deletingId === b.id ? 'Deleting...' : 'Delete'}
                        disabled={deletingId === b.id}
                        onClick={() => remove(b.id)}
                      >
                        <Trash2 size={16} />
                      </IconAction>
                    </ActionsCell>
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </TableWrap>

      <Pagination page={currentPage} pageSize={PAGE_SIZE} total={list.length} onChange={setPage} />
    </ListCard>
  );
}
