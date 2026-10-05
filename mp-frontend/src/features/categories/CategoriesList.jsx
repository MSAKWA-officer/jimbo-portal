import { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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

export default function CategoriesList() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/categories');
      setList(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load the list of categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete the category "${name}"?`);
    if (!confirmed) return;

    setError('');
    setDeletingId(id);

    try {
      await api.delete(`/categories/${id}`);
      setList((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the category.');
    } finally {
      setDeletingId(null);
    }
  };

  // Utafutaji + kurasa hufanyika kwenye browser (orodha ni fupi)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [list, search]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <ListCard>
      <ListHeader
        title="Request Categories"
        subtitle={`${list.length} registered`}
        actionTo="/categories/create"
        actionLabel="Add Category"
      />

      <ErrorBanner>{error}</ErrorBanner>

      <FilterBar>
        <input
          placeholder="Search by name or description"
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
            <Th>Description</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <EmptyRow colSpan={3}>Loading...</EmptyRow>
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={3}>No categories found.</EmptyRow>
          ) : (
            rows.map((c) => (
              <tr key={c.id}>
                <Td left className="font-semibold">{c.name}</Td>
                <Td left>{c.description || '-'}</Td>
                <Td>
                  <ActionsCell>
                    <IconAction variant="edit" title="Edit" to={`/categories/${c.id}/edit`}>
                      <Pencil size={16} />
                    </IconAction>

                    <IconAction
                      variant="danger"
                      title={deletingId === c.id ? 'Deleting...' : 'Delete'}
                      disabled={deletingId === c.id}
                      onClick={() => handleDelete(c.id, c.name)}
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

      <Pagination
        page={currentPage}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        onChange={setPage}
      />
    </ListCard>
  );
}
