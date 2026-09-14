import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const statusStyles = {
  planned: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-black',
};

const statusLabels = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function ProjectActivityView() {
  const { id } = useParams();

  const [activity, setActivity] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');

      try {
        const res = await api.get(`/project-activities/${id}`);
        setActivity(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load activity details.');
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

  if (error || !activity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">
        <div className="text-base bg-red-50 text-red-700 px-3 py-2 rounded-md mb-4">
          {error || 'Activity not found.'}
        </div>
        <Link to="/project-activities" className="text-base text-[#0B2A4A] hover:underline">
          &larr; Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">{activity.title}</h1>
          <p className="text-base text-black mt-1">
            {activity.project?.title ? (
              <Link to={`/projects/${activity.project.id}`} className="hover:underline">
                {activity.project.title}
              </Link>
            ) : (
              'Project not set'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/project-activities/${activity.id}/edit`}
            className="bg-[#0B2A4A] hover:bg-[#123B63] text-white text-base font-medium px-4 py-2 rounded-md"
          >
            Edit
          </Link>
          <Link to="/project-activities" className="text-base text-[#0B2A4A] hover:underline">
            &larr; Back
          </Link>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50/40 border border-[#0B2A4A]/20 rounded-xl p-4">
          <p className="text-sm text-black">Activity Status</p>
          <span className={`inline-block mt-1 text-sm font-medium px-2 py-1 rounded-full ${statusStyles[activity.status]}`}>
            {statusLabels[activity.status]}
          </span>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-black">Activity Date</p>
          <p className="text-base font-semibold text-black mt-1">{formatDate(activity.activityDate)}</p>
        </div>
      </div>

      {activity.description && (
        <div className="mb-6">
          <p className="text-sm font-medium text-black mb-1">Description</p>
          <p className="text-base text-black">{activity.description}</p>
        </div>
      )}

      {activity.recordedBy && (
        <div className="mb-2 text-base text-black">
          Recorded By: <span className="font-semibold">{activity.recordedBy.fullName}</span>
        </div>
      )}

      {activity.notes && (
        <div className="mt-6 border-t pt-4">
          <p className="text-sm font-medium text-black mb-1">Additional Notes</p>
          <p className="text-base text-black">{activity.notes}</p>
        </div>
      )}
    </div>
  );
}
