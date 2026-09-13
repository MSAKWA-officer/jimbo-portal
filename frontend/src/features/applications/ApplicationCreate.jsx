import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const emptyForm = {
  constituentId: '',
  categoryId: '',
  title: '',
  description: '',
  priority: 'medium',
};

export default function ApplicationCreate() {
  const navigate = useNavigate();

  const [constituents, setConstituents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  // Identification letter
  const [identificationLetter, setIdentificationLetter] = useState(null);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/constituents', { params: { limit: 100 } })
      .then((res) => setConstituents(res.data.data))
      .catch(() => {});

    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const handleLetterChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setIdentificationLetter(null);
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('The letter must be a PDF, JPG or PNG.');
      e.target.value = '';
      setIdentificationLetter(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('The letter cannot exceed 5MB in size.');
      e.target.value = '';
      setIdentificationLetter(null);
      return;
    }

    setError('');
    setIdentificationLetter(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identificationLetter) {
      setError(
        'Please attach the Identification Letter from the Local Government.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('constituentId', form.constituentId);
      formData.append('categoryId', form.categoryId);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('priority', form.priority);
      formData.append('identificationLetter', identificationLetter);

      await api.post('/requests', formData);

      navigate('/applications');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to submit the application.'
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
          New Application
        </h1>

        <Link
          to="/applications"
          className="text-base text-[#0B2A4A] hover:underline"
        >
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Constituent + Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <select
            required
            className="border rounded-md px-3 py-2 text-base text-black"
            value={form.constituentId}
            onChange={(e) =>
              setForm({ ...form, constituentId: e.target.value })
            }
          >
            <option value="">-- Select Constituent --</option>

            {constituents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>

          <select
            required
            className="border rounded-md px-3 py-2 text-base text-black"
            value={form.categoryId}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value })
            }
          >
            <option value="">-- Select Category --</option>

            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

        </div>

        {/* Title */}
        <input
          placeholder="Application title"
          required
          className="w-full border rounded-md px-3 py-2 text-base text-black"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        {/* Description */}
        <textarea
          placeholder="Full description of the application"
          required
          rows={4}
          className="w-full border rounded-md px-3 py-2 text-base text-black"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        {/* Priority */}
        <select
          className="border rounded-md px-3 py-2 text-base text-black"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option value="low">Priority: Low</option>
          <option value="medium">Priority: Medium</option>
          <option value="high">Priority: High</option>
          <option value="urgent">Priority: Urgent</option>
        </select>

        {/* IDENTIFICATION LETTER */}
        <div className="border border-[#0B2A4A]/20 rounded-lg p-4 bg-blue-50/40">

          <label
            htmlFor="identificationLetter"
            className="block text-base font-semibold text-[#0B2A4A] mb-2"
          >
            Identification Letter from Local Government *
          </label>

          <p className="text-sm text-black mb-3">
            Attach the identification letter issued by the Local
            Government.
          </p>

          <input
            id="identificationLetter"
            type="file"
            required
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleLetterChange}
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

          {identificationLetter && (
            <div className="mt-3 bg-white border rounded-md px-3 py-2 text-base">
              <p className="font-semibold text-black">
                📄 {identificationLetter.name}
              </p>

              <p className="text-sm text-black mt-1">
                {(identificationLetter.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          <p className="text-sm text-black mt-2">
            Allowed types: PDF, JPG, PNG — maximum size 5MB.
          </p>

        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0B2A4A] hover:bg-[#123B63] disabled:bg-gray-400 text-white text-base font-medium px-5 py-2.5 rounded-md"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>

          <Link
            to="/applications"
            className="bg-gray-100 hover:bg-gray-200 text-black text-base font-medium px-5 py-2.5 rounded-md"
          >
            Cancel
          </Link>
        </div>

      </form>

    </div>
  );
}
