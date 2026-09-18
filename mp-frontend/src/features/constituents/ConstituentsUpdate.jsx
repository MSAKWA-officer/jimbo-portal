import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios';

const emptyForm = {
  fullName: '',
  gender: '',
  phone: '',
  email: '',
  nationalId: '',
  region: '',
  district: '',
  ward: '',
  village: '',
};

export default function ConstituentsUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCitizen = user?.role === 'citizen';

  // A citizen always edits their OWN profile via /constituents/me,
  // regardless of what :id is in the URL.
  const endpoint = isCitizen ? '/constituents/me' : `/constituents/${id}`;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get(endpoint);

      setForm({
        fullName: data.fullName || '',
        gender: data.gender || '',
        phone: data.phone || '',
        email: data.email || '',
        nationalId: data.nationalId || '',
        region: data.region || '',
        district: data.district || '',
        ward: data.ward || '',
        village: data.village || '',
      });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load the constituent\'s details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.put(endpoint, form);
      navigate('/constituents');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update the constituent.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 bg-gray-200 border border-gray-300 rounded-xl shadow-sm">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Edit Constituent</h1>

        <Link to="/constituents" className="text-sm text-brand-700 hover:underline">
          &larr; Back to List
        </Link>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-base text-black">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-base font-medium text-black mb-1">Full Name</label>
            <input
              placeholder="Full name"
              required
              className="w-64 border rounded-md px-3 py-2 text-sm bg-white text-black"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-black mb-1">Gender</label>
            <select
              className="w-40 border rounded-md px-3 py-2 text-sm bg-white text-black"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Gender</option>
              <option value="me">Male</option>
              <option value="ke">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-medium text-black mb-1">Phone Number</label>
            <input
              placeholder="Phone number"
              className="w-48 border rounded-md px-3 py-2 text-sm bg-white text-black"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-black mb-1">Email</label>
            <input
              placeholder="Email"
              className="w-64 border rounded-md px-3 py-2 text-sm bg-white text-black"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-black mb-1">
              National ID (NIDA)
            </label>
            <input
              placeholder="National ID (NIDA)"
              className="w-56 border rounded-md px-3 py-2 text-sm bg-white text-black"
              value={form.nationalId}
              onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-black mb-1">Region</label>
            <input
              placeholder="Region"
              className="w-48 border rounded-md px-3 py-2 text-sm bg-white text-black"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-black mb-1">District</label>
            <input
              placeholder="District"
              className="w-48 border rounded-md px-3 py-2 text-sm bg-white text-black"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-black mb-1">Ward</label>
            <input
              placeholder="Ward"
              className="w-48 border rounded-md px-3 py-2 text-sm bg-white text-black"
              value={form.ward}
              onChange={(e) => setForm({ ...form, ward: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-base font-medium text-black mb-1">Village/Street</label>
            <input
              placeholder="Village/Street"
              className="w-48 border rounded-md px-3 py-2 text-sm bg-white text-black"
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white text-sm font-medium px-5 py-2.5 rounded-md"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>

            <Link
              to="/constituents"
              className="bg-white hover:bg-gray-100 border border-gray-300 text-black text-sm font-medium px-5 py-2.5 rounded-md"
            >
              Cancel
            </Link>
          </div>

        </form>
      )}

    </div>
  );
}
