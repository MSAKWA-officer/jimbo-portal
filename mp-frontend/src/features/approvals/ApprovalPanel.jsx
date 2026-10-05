import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock, MinusCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import { ErrorBanner } from '../../components/ListUI.jsx';

const stepStyles = {
  approved: { icon: CheckCircle2, color: 'text-green-600', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-600', label: 'Rejected' },
  pending: { icon: Clock, color: 'text-blue-600', label: 'Waiting for decision' },
  waiting: { icon: Clock, color: 'text-gray-400', label: 'Not started' },
  skipped: { icon: MinusCircle, color: 'text-gray-400', label: 'Skipped' },
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

// Shows the approval steps of one application and, when the logged-in user is
// allowed to decide the current step, the Approve / Reject controls.
// onChanged() is called after a decision so the parent can reload the request.
export default function ApprovalPanel({ requestId, onChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/approvals/request/${requestId}`);
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load approvals.');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (decision) => {
    if (decision === 'reject' && !comment.trim()) {
      setError('Please write the reason for rejecting.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.post(`/approvals/request/${requestId}/${decision}`, { comment });
      setComment('');
      await load();
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save the decision.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-6">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-gray-900 mb-2">
        Approval workflow
      </h2>

      <div className="border border-gray-200 rounded-lg p-4">
        <ErrorBanner>{error}</ErrorBanner>

        {loading && <p className="text-[14px] text-gray-500">Loading...</p>}

        {data && (
          <>
            <ol className="space-y-4">
              {data.steps.map((s) => {
                const st = stepStyles[s.status] || stepStyles.waiting;
                const Icon = st.icon;

                return (
                  <li key={s.id} className="flex gap-3">
                    <Icon size={20} className={`${st.color} shrink-0 mt-0.5`} />
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-gray-900">
                        Step {s.stepNumber}: {s.stepName}{' '}
                        <span className={`font-normal ${st.color}`}>- {st.label}</span>
                      </p>

                      {s.actedBy && (
                        <p className="text-[13px] text-gray-600">
                          {s.actedBy.fullName} ({s.actedBy.role}) on {formatDate(s.actedAt)}
                        </p>
                      )}

                      {s.comment && (
                        <p className="text-[13px] text-gray-800 mt-1 whitespace-pre-wrap break-words">
                          &ldquo;{s.comment}&rdquo;
                        </p>
                      )}

                      {s.status === 'pending' && (
                        <p className="text-[12px] text-gray-500">
                          Can be decided by: {s.requiredRoles.join(', ')}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {data.canAct && (
              <div className="mt-5 pt-4 border-t border-gray-200">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Comment (required when rejecting)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600"
                />

                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => decide('approve')}
                    className="h-[42px] px-5 rounded-lg bg-[#0b6e4f] hover:bg-[#095a41] disabled:opacity-60 text-white text-[14px] font-semibold"
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => decide('reject')}
                    className="h-[42px] px-5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-[14px] font-semibold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
