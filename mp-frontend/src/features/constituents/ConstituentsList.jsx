import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
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
  TableWrap,
  Td,
  Th,
  inputClass,
} from '../../components/ListUI.jsx';

const PAGE_SIZE = 10;

export default function ConstituentsList() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Pakia orodha (search inachelewa 300ms ili isitume ombi kila herufi)
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/constituents', {
          params: { search: search || undefined, page, limit: PAGE_SIZE },
        });
        if (cancelled) return;
        setList(data.data);
        setTotal(data.total ?? data.data.length);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load the list of constituents.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, page, reloadKey]);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;

    setError('');
    setDeletingId(id);

    try {
      await api.delete(`/constituents/${id}`);
      // Kama ulifuta mwisho wa ukurasa, rudi ukurasa uliotangulia
      if (list.length === 1 && page > 1) setPage(page - 1);
      else setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the constituent.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ListCard>
      <ListHeader
        title="Constituents"
        subtitle={`${total} registered`}
        actionTo="/constituents/create"
        actionLabel="Add Constituent"
      />

      <ErrorBanner>{error}</ErrorBanner>

      <FilterBar>
        <input
          placeholder="Search by name, phone, or National ID"
          className={`${inputClass} w-full sm:w-[360px]`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </FilterBar>

      <TableWrap>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>Ward / Village</Th>
            <Th>National ID</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <EmptyRow colSpan={5}>Loading...</EmptyRow>
          ) : list.length === 0 ? (
            <EmptyRow colSpan={5}>No constituents found.</EmptyRow>
          ) : (
            list.map((c) => (
              <tr key={c.id}>
                <Td left className="font-semibold">{c.fullName}</Td>
                <Td>{c.phone || '-'}</Td>
                <Td>{[c.ward, c.village].filter(Boolean).join(' / ') || '-'}</Td>
                <Td>{c.nationalId || '-'}</Td>
                <Td>
                  <ActionsCell>
                    <IconAction variant="edit" title="Edit" to={`/constituents/${c.id}/edit`}>
                      <Pencil size={16} />
                    </IconAction>

                    {isAdmin && (
                      <IconAction
                        variant="danger"
                        title={deletingId === c.id ? 'Deleting...' : 'Delete'}
                        disabled={deletingId === c.id}
                        onClick={() => handleDelete(c.id, c.fullName)}
                      >
                        <Trash2 size={16} />
                      </IconAction>
                    )}
                  </ActionsCell>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
    </ListCard>
  );
}
