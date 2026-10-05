import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

/*
  Vipande vinavyoshirikiwa na pages za orodha (Constituents, Categories,
  Applications). Ukitaka kubadilisha muonekano wa orodha zote, badilisha hapa.
*/

export const inputClass =
  'h-[42px] border border-gray-300 rounded-lg px-3 text-[14px] bg-white text-gray-800 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600';

export function ListCard({ children }) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      {children}
    </div>
  );
}

export function ListHeader({ title, subtitle, actionTo, actionLabel }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-[14px] text-gray-800 mt-1">{subtitle}</p>}
      </div>

      {actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 h-[44px] px-5 rounded-lg bg-[#0b6e4f] hover:bg-[#095a41] text-white text-[15px] font-semibold whitespace-nowrap transition-colors"
        >
          <Plus size={18} />
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function ErrorBanner({ children }) {
  if (!children) return null;
  return (
    <div className="text-[14px] bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg mb-4">
      {children}
    </div>
  );
}

export function FilterBar({ children }) {
  return <div className="flex flex-wrap items-center gap-3 mb-5">{children}</div>;
}

// Jedwali lenye mistari kamili (grid) kama kwenye muundo
export function TableWrap({ children }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-x-auto">
      <table className="w-full border-collapse [&_tbody>tr:last-child>td]:border-b-0">
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th
      className={`px-4 py-3 text-[13px] font-bold uppercase text-center text-gray-900 whitespace-nowrap bg-white border-b border-r border-gray-200 last:border-r-0 ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, left = false, className = '' }) {
  return (
    <td
      className={`px-4 py-3 text-[14px] text-gray-800 border-b border-r border-gray-200 last:border-r-0 ${
        left ? 'text-left' : 'text-center'
      } ${className}`}
    >
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-6 text-center text-[14px] text-gray-500">
        {children}
      </td>
    </tr>
  );
}

const iconVariants = {
  view: 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100',
  edit: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  danger: 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100',
  success: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
};

// Kitufe cha icon kwenye safu ya Actions. Ukipitisha `to` kinakuwa link.
export function IconAction({ variant = 'edit', title, to, onClick, disabled, children }) {
  const cls = `inline-flex items-center justify-center w-[36px] h-[34px] rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${iconVariants[variant]}`;

  if (to) {
    return (
      <Link to={to} title={title} aria-label={title} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cls}
    >
      {children}
    </button>
  );
}

export function ActionsCell({ children }) {
  return <div className="flex items-center justify-center gap-2">{children}</div>;
}

export function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const btn =
    'h-[40px] px-4 rounded-lg border text-[14px] transition-colors disabled:text-gray-300 disabled:border-gray-200 disabled:cursor-not-allowed enabled:text-gray-700 enabled:border-gray-300 enabled:hover:bg-gray-50';

  return (
    <div className="flex items-center justify-between gap-3 mt-4">
      <p className="text-[14px] text-gray-800">
        {total} records
        {pages > 1 && (
          <span className="text-gray-500">
            {' '}· Page {page} of {pages}
          </span>
        )}
      </p>

      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </button>
        <button type="button" className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

// Visanduku vya muhtasari (jumla) juu ya vichujio
export function SummaryGrid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">{children}</div>;
}

export function SummaryBox({ label, value, tone }) {
  const color =
    tone === 'danger' ? 'text-red-600' : tone === 'success' ? 'text-green-700' : 'text-gray-900';
  return (
    <div className="border border-gray-200 bg-white rounded-lg px-4 py-3">
      <p className="text-[13px] text-gray-600">{label}</p>
      <p className={`mt-1 text-[22px] font-bold leading-tight ${color}`}>{value}</p>
    </div>
  );
}
