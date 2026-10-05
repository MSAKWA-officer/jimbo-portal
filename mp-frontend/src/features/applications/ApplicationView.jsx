import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Paperclip, Pencil } from 'lucide-react';
import api from '../../api/axios';
import LetterViewer from './LetterViewer.jsx';
import ApprovalPanel from '../approvals/ApprovalPanel.jsx';
import { ErrorBanner, ListCard } from '../../components/ListUI.jsx';

const statusLabels = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-200 text-gray-800',
};

const statusDots = {
  pending: 'bg-yellow-500',
  in_review: 'bg-blue-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  completed: 'bg-gray-500',
};

const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : '-';

function Field({ label, children }) {
  return (
    <div className="px-4 py-3 border-b border-r border-gray-200">
      <p className="text-[12px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 text-[14px] text-gray-900 break-words">{children || '-'}</div>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <section className="mt-6">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-gray-900 mb-2">{title}</h2>
      {children}
    </section>
  );
}

// Gridi ya sehemu zenye mistari kamili (safu 2 kuanzia skrini ndogo-kati)
function FieldGrid({ children }) {
  const items = Array.isArray(children) ? children.flat().filter(Boolean) : [children];
  const fillers = items.length % 2; // kamilisha safu ya mwisho ili mistari ifungwe

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-gray-200 rounded-lg overflow-hidden">
      {items}
      {Array.from({ length: fillers }).map((_, i) => (
        <div key={`fill-${i}`} className="hidden sm:block border-b border-r border-gray-200" />
      ))}
    </div>
  );
}

export default function ApplicationView() {
  const { id } = useParams();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLetter, setShowLetter] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/requests/${id}`);
        if (!cancelled) setApp(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load application details.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const backLink = (
    <Link
      to="/applications"
      className="inline-flex items-center gap-2 h-[42px] px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-[14px] text-gray-700 transition-colors"
    >
      <ArrowLeft size={16} />
      Back to list
    </Link>
  );

  if (loading) {
    return (
      <ListCard>
        <p className="text-[14px] text-gray-500 py-6 text-center">Loading...</p>
      </ListCard>
    );
  }

  if (error || !app) {
    return (
      <ListCard>
        <ErrorBanner>{error || 'Application not found.'}</ErrorBanner>
        {backLink}
      </ListCard>
    );
  }

  const c = app.constituent;
  const hasLetter = Boolean(app.identificationLetterName);

  return (
    <ListCard>
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight break-words">
            {app.title}
          </h1>
          <p className="text-[14px] text-gray-800 mt-1 font-mono">{app.trackingNumber}</p>
        </div>

        <div className="flex items-center gap-2">
          {backLink}
          <Link
            to={`/applications/${app.id}/edit`}
            className="inline-flex items-center gap-2 h-[42px] px-5 rounded-lg bg-[#0b6e4f] hover:bg-[#095a41] text-white text-[15px] font-semibold transition-colors"
          >
            <Pencil size={16} />
            Edit
          </Link>
        </div>
      </div>

      {/* APPLICATION DETAILS */}
      <Block title="Application details">
        <FieldGrid>
          <Field label="Tracking no.">
            <span className="font-mono">{app.trackingNumber}</span>
          </Field>

          <Field label="Status">
            <span
              className={`inline-flex items-center gap-2 text-[13px] font-medium px-2.5 py-1 rounded-md ${
                statusColors[app.status] || ''
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${statusDots[app.status] || 'bg-gray-400'}`} />
              {statusLabels[app.status] || app.status}
            </span>
          </Field>

          <Field label="Priority">
            <span
              className={`inline-block text-[13px] font-medium px-2.5 py-1 rounded-md ${
                priorityColors[app.priority] || ''
              }`}
            >
              {priorityLabels[app.priority] || app.priority}
            </span>
          </Field>

          <Field label="Category">{app.category?.name}</Field>
          <Field label="Submitted by">{app.submittedBy?.fullName}</Field>
          <Field label="Submitted at">{formatDate(app.submittedAt || app.createdAt)}</Field>
          {app.resolvedAt && <Field label="Resolved at">{formatDate(app.resolvedAt)}</Field>}
          <Field label="Last updated">{formatDate(app.updatedAt)}</Field>
        </FieldGrid>
      </Block>

      {/* DESCRIPTION */}
      <Block title="Description">
        <div className="border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-gray-900 whitespace-pre-wrap break-words">
          {app.description || '-'}
        </div>
      </Block>

      {/* APPROVAL WORKFLOW */}
      <ApprovalPanel
        requestId={app.id}
        onChanged={() => setReloadKey((k) => k + 1)}
      />

      {/* CONSTITUENT */}
      <Block title="Constituent">
        <FieldGrid>
          <Field label="Full name">{c?.fullName}</Field>
          <Field label="Phone">{c?.phone}</Field>
          <Field label="Email">{c?.email}</Field>
          <Field label="National ID">{c?.nationalId}</Field>
          <Field label="Gender"><span className="capitalize">{c?.gender}</span></Field>
          <Field label="Region / District">
            {[c?.region, c?.district].filter(Boolean).join(' / ')}
          </Field>
          <Field label="Ward / Village">
            {[c?.ward, c?.village].filter(Boolean).join(' / ')}
          </Field>
        </FieldGrid>
      </Block>

      {/* IDENTIFICATION LETTER */}
      <Block title="Identification letter">
        <div className="border border-gray-200 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {hasLetter ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <Paperclip size={18} className="text-green-700 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-gray-900 truncate">
                    {app.identificationLetterName}
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Uploaded {formatDate(app.identificationLetterUploadedAt)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLetter(true)}
                className="inline-flex items-center gap-2 h-[38px] px-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[14px] font-medium transition-colors"
              >
                <Eye size={16} />
                View letter
              </button>
            </>
          ) : (
            <p className="text-[14px] text-red-600">No identification letter attached.</p>
          )}
        </div>
      </Block>

      {showLetter && (
        <LetterViewer
          letter={{
            requestId: app.id,
            name: app.identificationLetterName,
            trackingNumber: app.trackingNumber,
            title: app.title,
          }}
          onClose={() => setShowLetter(false)}
        />
      )}
    </ListCard>
  );
}
