import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { policiesAPI, policyholdersAPI } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FeedbackAlert from '../components/FeedbackAlert.jsx';
import Pagination from '../components/Pagination.jsx';
import {
  ScrollText,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit,
  Shield,
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Policies() {
  const { user, isAdmin, isOfficer } = useAuth();

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Policyholders for dropdown in create modal
  const [policyholders, setPolicyholders] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Controlled form state
  const [formData, setFormData] = useState({
    policyholderId: '',
    policyName: '',
    policyType: 'Health',
    coverageAmount: '',
    premiumAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active'
  });

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: 8,
        ...(search && { search }),
        ...(typeFilter && { policyType: typeFilter })
      }).toString();

      const res = await policiesAPI.getAll(query);
      if (res.success) {
        setPolicies(res.policies || []);
        setTotalPages(res.totalPages || 1);
        setTotalRecords(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load policies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [currentPage, typeFilter]);

  const handleOpenCreateModal = async () => {
    setShowCreateModal(true);
    setModalError(null);
    try {
      const res = await policyholdersAPI.getAll('limit=50');
      if (res.success && res.policyholders.length > 0) {
        setPolicyholders(res.policyholders);
        setFormData(prev => ({ ...prev, policyholderId: res.policyholders[0]._id }));
      }
    } catch (e) {
      setModalError('Failed to fetch policyholders list.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPolicies();
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setModalError(null);

    // Validation
    if (!formData.policyholderId || !formData.policyName.trim()) {
      setModalError('Please select a policyholder and enter the policy name.');
      return;
    }

    if (!formData.coverageAmount || Number(formData.coverageAmount) <= 0) {
      setModalError('Please enter a valid coverage amount.');
      return;
    }

    if (!formData.premiumAmount || Number(formData.premiumAmount) <= 0) {
      setModalError('Please enter a valid premium amount.');
      return;
    }

    setModalLoading(true);
    try {
      const res = await policiesAPI.create({
        ...formData,
        coverageAmount: Number(formData.coverageAmount),
        premiumAmount: Number(formData.premiumAmount)
      });
      if (res.success) {
        setShowCreateModal(false);
        setSuccessMsg(res.message);
        fetchPolicies();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to create policy.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy record?')) return;
    try {
      const res = await policiesAPI.delete(policyId);
      if (res.success) {
        setSuccessMsg('Policy deleted successfully.');
        fetchPolicies();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete policy.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Insurance Policies</h1>
          <p className="text-sm text-slate-500">
            Mongoose Policy model CRUD: Health, Auto, Home, and Life coverage policies
          </p>
        </div>

        {(isAdmin || isOfficer) && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Issue New Policy
          </button>
        )}
      </div>

      {successMsg && <FeedbackAlert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />}
      {error && <FeedbackAlert type="error" message={error} onDismiss={() => setError(null)} />}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by policy number or plan name..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto"
          >
            <option value="">All Policy Types</option>
            <option value="Health">Health Insurance</option>
            <option value="Auto">Auto Insurance</option>
            <option value="Home">Home Insurance</option>
            <option value="Life">Life Insurance</option>
          </select>
        </div>
      </div>

      {/* Policy Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading policy records..." />
        ) : policies.length === 0 ? (
          <EmptyState
            title="No Policies Found"
            description={search || typeFilter ? 'No policies matched your search criteria.' : 'No insurance policies registered yet.'}
            actionLabel={isAdmin ? 'Issue First Policy' : undefined}
            onAction={isAdmin ? handleOpenCreateModal : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Policy Number</th>
                    <th className="px-6 py-3">Plan Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Policyholder</th>
                    <th className="px-6 py-3">Max Coverage</th>
                    <th className="px-6 py-3">Annual Premium</th>
                    <th className="px-6 py-3">Validity</th>
                    <th className="px-6 py-3">Status</th>
                    {isAdmin && <th className="px-6 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {policies.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                        {p.policyNumber}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {p.policyName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {p.policyType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-800">
                        {p.policyholderName}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ₹{p.coverageAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        ₹{p.premiumAmount?.toLocaleString('en-IN')}/yr
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {p.startDate} to {p.endDate}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeletePolicy(p._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete Policy"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={totalRecords}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </div>

      {/* Issue Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Issue New Insurance Policy</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-3">
                <FeedbackAlert type="error" message={modalError} onDismiss={() => setModalError(null)} />
              </div>
            )}

            <form onSubmit={handleCreatePolicy} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Assign Policyholder *
                </label>
                {policyholders.length === 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    No policyholder records found. Create a policyholder first.
                  </p>
                ) : (
                  <select
                    value={formData.policyholderId}
                    onChange={(e) => setFormData({ ...formData, policyholderId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    {policyholders.map((ph) => (
                      <option key={ph._id} value={ph._id}>
                        {ph.fullName} ({ph.phone})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Policy Plan Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Platinum Family Health Cover"
                    value={formData.policyName}
                    onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Insurance Category *
                  </label>
                  <select
                    value={formData.policyType}
                    onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Health">Health</option>
                    <option value="Auto">Auto</option>
                    <option value="Home">Home</option>
                    <option value="Life">Life</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Coverage Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    placeholder="e.g. 1000000"
                    value={formData.coverageAmount}
                    onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Annual Premium (₹) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    placeholder="e.g. 18500"
                    value={formData.premiumAmount}
                    onChange={(e) => setFormData({ ...formData, premiumAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || policyholders.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {modalLoading ? 'Issuing...' : 'Issue Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
