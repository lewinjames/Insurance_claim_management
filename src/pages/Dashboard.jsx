import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { claimsAPI, reportsAPI } from '../api.js';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FeedbackAlert from '../components/FeedbackAlert.jsx';
import {
  FileCheck2,
  Clock,
  CheckCircle,
  BadgeDollarSign,
  ArrowRight,
  PlusCircle,
  FileSearch,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [reportRes, claimsRes] = await Promise.all([
          reportsAPI.getSummary(),
          claimsAPI.getAll('limit=5')
        ]);

        if (reportRes.success) {
          setStats(reportRes.data);
        }
        if (claimsRes.success) {
          setRecentClaims(claimsRes.claims || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading system dashboard metrics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-mono mb-2 border border-blue-400/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Project 29 • {user?.role} Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {user?.name}
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Insurance Claim Processing System with 7 Mongoose schemas, role-based workflows, and JWT security.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {user?.role === 'Policyholder' && (
              <Link
                to="/claims"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                File New Claim
              </Link>
            )}
            {user?.role === 'Claim Officer' && (
              <Link
                to="/reviews"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              >
                <FileSearch className="w-4 h-4" />
                Pending Reviews
              </Link>
            )}
            {user?.role === 'Admin' && (
              <Link
                to="/settlements"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              >
                <BadgeDollarSign className="w-4 h-4" />
                Process Payouts
              </Link>
            )}
          </div>
        </div>
      </div>

      {error && <FeedbackAlert type="error" message={error} onDismiss={() => setError(null)} />}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Claims</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totals?.totalClaims || 0}</h3>
            <p className="text-xs text-slate-500 mt-1">₹{(stats?.financials?.totalClaimAmount || 0).toLocaleString('en-IN')} requested</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Under Review</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats?.statusCounts?.['Under Review'] || 0}</h3>
            <p className="text-xs text-slate-500 mt-1">{stats?.statusCounts?.Submitted || 0} submitted (unassigned)</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Claims</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats?.statusCounts?.Approved || 0}</h3>
            <p className="text-xs text-slate-500 mt-1">Ready for settlement payout</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disbursed Funds</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">
              ₹{(stats?.financials?.totalSettledAmount || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{stats?.statusCounts?.Settled || 0} claims settled</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BadgeDollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Role Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/claims"
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">1</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
          </div>
          <h4 className="font-semibold text-slate-900">Claim Dossier & Filing</h4>
          <p className="text-xs text-slate-500 mt-1">
            File claims with proof documents, view incident records and timeline.
          </p>
        </Link>

        <Link
          to="/reviews"
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-sm transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">2</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
          </div>
          <h4 className="font-semibold text-slate-900">Officer Investigation</h4>
          <p className="text-xs text-slate-500 mt-1">
            Examine bills, damage photos, assess eligible amounts, approve or reject.
          </p>
        </Link>

        <Link
          to="/settlements"
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-sm transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">3</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
          </div>
          <h4 className="font-semibold text-slate-900">Settlement Disbursement</h4>
          <p className="text-xs text-slate-500 mt-1">
            Disburse approved funds via Bank NEFT, Cheque or UPI with ref transaction ID.
          </p>
        </Link>
      </div>

      {/* Recent Claims Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Recent Claims Pipeline</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live records from Mongoose Claim collection</p>
          </div>
          <Link
            to="/claims"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All ({stats?.totals?.totalClaims || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentClaims.length === 0 ? (
          <EmptyState
            title="No Claims Found"
            description="No insurance claims have been registered in the system yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Claim #</th>
                  <th className="px-6 py-3">Policy & Type</th>
                  <th className="px-6 py-3">Policyholder</th>
                  <th className="px-6 py-3">Claim Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Officer</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentClaims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                      {claim.claimNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{claim.policyName}</div>
                      <span className="text-xs text-slate-500">{claim.policyNumber} ({claim.policyType})</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">{claim.policyholderName}</div>
                      <div className="text-xs text-slate-400">{claim.policyholderPhone}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ₹{claim.claimAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {claim.assignedOfficerName || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/claims/${claim._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-md hover:bg-blue-100 transition"
                      >
                        Open Dossier
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
