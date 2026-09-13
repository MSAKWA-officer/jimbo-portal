import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const statusStyles = {
  planned: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-black',
};

const statusLabels = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

export default function ProjectView() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');

      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load project details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <p className="text-base text-black">Loading...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error || 'Project not found.'}
        </div>
        <Link to="/projects" className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>
    );
  }

  const overBudget =
    project.estimatedCost && Number(project.actualCost) > Number(project.estimatedCost);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">{project.title}</h1>
          <p className="text-base text-black mt-1">
            {project.location || 'Location not set'}
            {project.category?.name ? ` • ${project.category.name}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${project.id}/edit`}
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-base font-medium px-4 py-2 rounded-md"
          >
            Edit
          </Link>
          <Link to="/projects" className="text-base text-[#0B2A4A] hover:underline">
            &larr; Back
          </Link>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50/40 border border-[#0B2A4A]/20 rounded-xl p-4">
          <p className="text-sm text-black">Project Status</p>
          <span className={`inline-block mt-1 text-sm font-medium px-2 py-1 rounded-full ${statusStyles[project.status]}`}>
            {statusLabels[project.status]}
          </span>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-black">Estimated / Actual Cost</p>
          <p className="text-base font-semibold text-black mt-1">
            TZS {project.estimatedCost ? currency(project.estimatedCost) : '—'} / TZS {currency(project.actualCost)}
          </p>
          {overBudget && <p className="text-sm text-red-600 mt-1">Exceeded the estimated budget</p>}
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-black">Progress</p>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-2">
            <div
              className="bg-[#0B2A4A] h-2"
              style={{ width: `${Math.min(100, Number(project.progressPercentage) || 0)}%` }}
            />
          </div>
          <p className="text-sm text-black mt-1">{project.progressPercentage || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-base">
        <div>
          <p className="text-sm font-medium text-black mb-1">Start Date</p>
          <p className="text-black">{formatDate(project.startDate)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-black mb-1">End Date</p>
          <p className="text-black">{formatDate(project.endDate)}</p>
        </div>
      </div>

      {project.description && (
        <div className="mb-6">
          <p className="text-sm font-medium text-black mb-1">Description</p>
          <p className="text-base text-black">{project.description}</p>
        </div>
      )}

      {project.constituent && (
        <div className="mb-6 text-base text-black">
          Beneficiary: <span className="font-semibold">{project.constituent.fullName}</span>
        </div>
      )}

      {project.manager && (
        <div className="mb-2 text-base text-black">
          Project Manager: <span className="font-semibold">{project.manager.fullName}</span>
        </div>
      )}

      {project.notes && (
        <div className="mt-6 border-t pt-4">
          <p className="text-sm font-medium text-black mb-1">Additional Notes</p>
          <p className="text-base text-black">{project.notes}</p>
        </div>
      )}
    </div>
  );
}
