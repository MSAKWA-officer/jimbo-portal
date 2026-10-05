import { useEffect, useState } from 'react';
import api from '../../api/axios';

// ---------------------------------------------------------------
// Letter viewer (modal)
// Loads the letter through the API (GET /requests/:id/letter) so the
// login token is sent and the file path on the server does not matter.
// ---------------------------------------------------------------
const readError = async (err, fallback) => {
  const data = err.response?.data;
  try {
    if (data instanceof Blob) {
      const parsed = JSON.parse(await data.text());
      return parsed.message || fallback;
    }
  } catch {
    /* ignore */
  }
  return data?.message || fallback;
};

export default function LetterViewer({ letter, onClose }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [kind, setKind] = useState('pdf'); // pdf | image | other
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let url = '';
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get(`/requests/${letter.requestId}/letter`, {
          responseType: 'blob',
        });
        if (cancelled) return;

        const type = res.data.type || '';
        const ext = String(letter.name || '').split('.').pop().toLowerCase();
        if (type.includes('pdf') || ext === 'pdf') setKind('pdf');
        else if (type.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(ext)) setKind('image');
        else setKind('other');

        url = URL.createObjectURL(res.data);
        setBlobUrl(url);
      } catch (err) {
        if (!cancelled) setError(await readError(err, 'Failed to load the letter.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [letter.requestId, letter.name]);

  // Close with Esc + lock page scroll while open
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Identification letter"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b">
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">{letter.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {letter.trackingNumber} · {letter.title}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {blobUrl && (
              <>
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Open in new tab
                </a>
                <a
                  href={blobUrl}
                  download={letter.name}
                  className="text-xs font-medium px-3 py-1.5 rounded-md bg-[#0B2A4A] hover:bg-[#123B63] text-white"
                >
                  Download
                </a>
              </>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="relative flex-1 min-h-0 bg-gray-100">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
              Loading letter...
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="max-w-md text-center bg-red-50 text-red-700 text-sm px-4 py-3 rounded-md">
                {error}
              </div>
            </div>
          )}

          {!error && blobUrl && kind === 'pdf' && (
            <iframe title={letter.name} src={blobUrl} className="absolute inset-0 w-full h-full border-0" />
          )}

          {!error && blobUrl && kind === 'image' && (
            <div className="absolute inset-0 overflow-auto flex items-start justify-center p-4">
              <img src={blobUrl} alt={letter.name} className="max-w-full h-auto rounded shadow" />
            </div>
          )}

          {!error && blobUrl && kind === 'other' && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-600">
              This file type cannot be previewed. Use Download instead.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
