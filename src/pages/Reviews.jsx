import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../api.js';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FeedbackAlert from '../components/FeedbackAlert.jsx';
import {
  FileSearch,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  HelpCircle,
  Calendar,
  UserCheck
} from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRec, setFilterRec] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewsAPI.getAll(filterRec ? `recommendation=${filterRec}` : '');
      if (res.success) {
        setReviews(res.reviews || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch claim reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterRec]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Claim Officer Reviews</h1>
          <p className="text-sm text-slate-500">
            Audit logs and assessment recommendations from Mongoose Review collection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterRec}
            onChange={(e) => setFilterRec(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Recommendations</option>
            <option value="Approve">Approved</option>
            <option value="Request More Info">Request More Info</option>
            <option value="Reject">Rejected</option>
          </select>
        </div>
      </div>

      {error && <FeedbackAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading review audits..." />
        ) : reviews.length === 0 ? (
          <EmptyState
            title="No Reviews Found"
            description="No officer reviews recorded matching the current filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Claim Reference</th>
                  <th className="px-6 py-3">Assigned Officer</th>
                  <th className="px-6 py-3">Recommendation</th>
                  <th className="px-6 py-3">Assessed Amount</th>
                  <th className="px-6 py-3">Investigation Findings</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                      {rev.claimNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        {rev.officerName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        rev.recommendation === 'Approve'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rev.recommendation === 'Reject'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {rev.recommendation === 'Approve' && <CheckCircle className="w-3 h-3" />}
                        {rev.recommendation === 'Reject' && <XCircle className="w-3 h-3" />}
                        {rev.recommendation === 'Request More Info' && <HelpCircle className="w-3 h-3" />}
                        {rev.recommendation}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ₹{rev.reviewedAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate" title={rev.reviewNotes}>
                      {rev.reviewNotes}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(rev.reviewDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/claims/${rev.claimId}`}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Open Claim
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
