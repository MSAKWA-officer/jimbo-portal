import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const emptyForm = {
  title: '',
  documentType: 'barua',
  description: '',
};

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
];

export default function DocumentUpload() {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) {
      setFile(null);
      return;
    }

    if (!allowedTypes.includes(selected.type)) {
      setError('File type not accepted. Use PDF, Word, Excel, JPG or PNG.');
      e.target.value = '';
      setFile(null);
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('The file cannot exceed 10MB in size.');
      e.target.value = '';
      setFile(null);
      return;
    }

    setError('');
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please attach the letter/document/report file.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('title', form.title);
      formData.append('documentType', form.documentType);
      formData.append('description', form.description);
      formData.append('file', file);

      await api.post('/documents', formData);

      navigate('/documents');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit the document.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">
          Share Document for Approval
        </h1>

        <Link to="/documents" className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Title */}
        <input
          placeholder="Document title (e.g. Meeting Request Letter)"
          required
          className="w-full border rounded-md px-3 py-2 text-base text-black"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        {/* Type */}
        <select
          className="w-full border rounded-md px-3 py-2 text-base text-black"
          value={form.documentType}
          onChange={(e) => setForm({ ...form, documentType: e.target.value })}
        >
          <option value="barua">Letter</option>
          <option value="ripoti">Report</option>
          <option value="hati">Document</option>
          <option value="nyingine">Other</option>
        </select>

        {/* Description */}
        <textarea
          placeholder="Short description of this document (optional)"
          rows={3}
          className="w-full border rounded-md px-3 py-2 text-base text-black"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* FILE */}
        <div className="border border-[#0B2A4A]/20 rounded-lg p-4 bg-blue-50/40">
          <label htmlFor="file" className="block text-base font-semibold text-[#0B2A4A] mb-2">
            Letter / Document / Report File *
          </label>

          <p className="text-sm text-black mb-3">
            Attach a copy of the document that needs approval.
          </p>

          <input
            id="file"
            type="file"
            required
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="block w-full text-base text-black
              file:mr-4
              file:py-2
              file:px-4
              file:rounded-md
              file:border-0
              file:text-base
              file:font-medium
              file:bg-[#0B2A4A]
              file:text-white
              hover:file:bg-[#123B63]"
          />

          {file && (
            <div className="mt-3 bg-white border rounded-md px-3 py-2 text-base">
              <p className="font-semibold text-black">📄 {file.name}</p>
              <p className="text-sm text-black mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          <p className="text-sm text-black mt-2">
            Allowed types: PDF, Word, Excel, JPG, PNG — maximum size 10MB.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-base font-medium px-5 py-2.5 rounded-md"
          >
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>

          <Link
            to="/documents"
            className="bg-gray-100 hover:bg-gray-200 text-black text-base font-medium px-5 py-2.5 rounded-md"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
