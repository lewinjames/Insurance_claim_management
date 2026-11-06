import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { claimsAPI, policiesAPI } from '../api.js';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FeedbackAlert from '../components/FeedbackAlert.jsx';
import Pagination from '../components/Pagination.jsx';
import {
  FileCheck2,
  PlusCircle,
  Search,
  Filter,
  Eye,
  X,
  Upload,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Claims() {
  const { user } = useAuth();

  // List states
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filter & Pagination states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal states for creating claim
  const [showModal, setShowModal] = useState(false);
  const [availablePolicies, setAvailablePolicies] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Controlled form state
  const [formData, setFormData] = useState({
    policyId: '',
    incidentDate: new Date().toISOString().split('T')[0],
    claimAmount: '',
    reason: '',
    description: '',
    docName: '',
    docType: 'Medical Bill',
    docUrl: '',
    docRemarks: ''
  });

  // Fetch claims from backend
  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 8,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter })
      }).toString();

      const res = await claimsAPI.getAll(queryParams);
      if (res.success) {
        setClaims(res.claims || []);
        setTotalPages(res.totalPages || 1);
        setTotalRecords(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [currentPage, statusFilter]);

  // Load policies when opening modal
  const handleOpenModal = async () => {
    setShowModal(true);
    setModalError(null);
    setModalLoading(true);
    try {
      const res = await policiesAPI.getAll('status=Active');
      if (res.success) {
        setAvailablePolicies(res.policies || []);
        if (res.policies.length > 0) {
          setFormData(prev => ({ ...prev, policyId: res.policies[0]._id }));
        }
      }
    } catch (err) {
      setModalError('Failed to load eligible active policies.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchClaims();
  };

  // Submit claim handler using event.preventDefault()
  const handleCreateClaim = async (e) => {
    e.preventDefault();
    setModalError(null);

    // Frontend validation
    if (!formData.policyId) {
      setModalError('Please select a valid policy for this claim.');
      return;
    }

    if (!formData.claimAmount || Number(formData.claimAmount) <= 0) {
      setModalError('Please enter a valid positive claim amount.');
      return;
    }

    if (!formData.reason.trim()) {
      setModalError('Please specify the cause or reason for the claim.');
      return;
    }

    if (!formData.description.trim()) {
      setModalError('Please enter a detailed description of the incident.');
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        policyId: formData.policyId,
        incidentDate: formData.incidentDate,
        claimAmount: Number(formData.claimAmount),
        reason: formData.reason,
        description: formData.description,
        ...(formData.docName && {
          initialDocument: {
            documentName: formData.docName,
            documentType: formData.docType,
            fileUrl: formData.docUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
            remarks: formData.docRemarks
          }
        })
      };

      const res = await claimsAPI.create(payload);
      if (res.success) {
        setShowModal(false);
        setSuccessMsg(res.message);
        // Reset form
        setFormData({
          policyId: '',
          incidentDate: new Date().toISOString().split('T')[0],
          claimAmount: '',
          reason: '',
          description: '',
          docName: '',
          docType: 'Medical Bill',
          docUrl: '',
          docRemarks: ''
        });
        fetchClaims();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to submit claim.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Insurance Claims</h1>
          <p className="text-sm text-slate-500">
            CRUD screens and lifecycle management for insurance claims and documents
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          File New Claim
        </button>
      </div>

      {successMsg && <FeedbackAlert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />}
      {error && <FeedbackAlert type="error" message={error} onDismiss={() => setError(null)} />}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Claim #, reason, description..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Settled">Settled</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Retrieving claims list from MongoDB..." />
        ) : claims.length === 0 ? (
          <EmptyState
            title="No Claims Found"
            description={search || statusFilter ? 'No claims match your filters.' : 'No insurance claims have been registered yet.'}
            actionLabel="Submit First Claim"
            onAction={handleOpenModal}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Claim Number</th>
                    <th className="px-6 py-3">Policy Covered</th>
                    <th className="px-6 py-3">Policyholder</th>
                    <th className="px-6 py-3">Incident Date</th>
                    <th className="px-6 py-3">Claim Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Assigned Officer</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                        {claim.claimNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{claim.policyName}</div>
                        <span className="text-xs text-slate-500 font-mono">{claim.policyNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900">{claim.policyholderName}</div>
                        <div className="text-xs text-slate-400">{claim.policyholderPhone}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {claim.incidentDate?.split('T')[0]}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ₹{claim.claimAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {claim.assignedOfficerName ? (
                          <span className="text-slate-800 font-medium">{claim.assignedOfficerName}</span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-mono">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/claims/${claim._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Dossier
                        </Link>
                      </td>
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

      {/* File New Claim Modal with Controlled Form & event.preventDefault() */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-lg">Submit New Insurance Claim</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4">
                <FeedbackAlert type="error" message={modalError} onDismiss={() => setModalError(null)} />
              </div>
            )}

            <form onSubmit={handleCreateClaim} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Applicable Policy *
                </label>
                {availablePolicies.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>No active policies found. Please ensure policies are registered first.</span>
                  </div>
                ) : (
                  <select
                    value={formData.policyId}
                    onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    {availablePolicies.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.policyNumber} - {p.policyName} ({p.policyType}) [Max Cover: ₹{p.coverageAmount?.toLocaleString('en-IN')}]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Incident *
                  </label>
                  <input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Claim Amount Requested (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50000"
                    value={formData.claimAmount}
                    onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reason / Summary of Claim *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hospitalization for viral fever treatment"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Incident Description *
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide chronological details of what happened, hospital/garage name, emergency measures taken..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Initial Document Attachment Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Attach Supporting Document (Optional)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Document Name / File</label>
                    <input
                      type="text"
                      placeholder="e.g. Hospital_Bill_Invoice.pdf"
                      value={formData.docName}
                      onChange={(e) => setFormData({ ...formData, docName: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Document Category</label>
                    <select
                      value={formData.docType}
                      onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Medical Bill">Medical Bill</option>
                      <option value="Police Report">Police Report</option>
                      <option value="Damage Photo">Damage Photo</option>
                      <option value="Invoice">Invoice / Repair Estimate</option>
                      <option value="ID Proof">Government ID Proof</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Remarks / Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Original signed stamp from hospital medical superintendent"
                    value={formData.docRemarks}
                    onChange={(e) => setFormData({ ...formData, docRemarks: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || availablePolicies.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {modalLoading ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
