import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { policyholdersAPI } from '../api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FeedbackAlert from '../components/FeedbackAlert.jsx';
import Pagination from '../components/Pagination.jsx';
import {
  Users2,
  PlusCircle,
  Search,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  IndianRupee,
  X,
  Trash2
} from 'lucide-react';

export default function Policyholders() {
  const { user, isAdmin } = useAuth();

  const [policyholders, setPolicyholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Controlled form
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    address: '',
    phone: '',
    emergencyContact: '',
    occupation: 'Professional',
    annualIncome: '800000'
  });

  const fetchPolicyholders = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: 8,
        ...(search && { search })
      }).toString();

      const res = await policyholdersAPI.getAll(query);
      if (res.success) {
        setPolicyholders(res.policyholders || []);
        setTotalPages(res.totalPages || 1);
        setTotalRecords(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch policyholders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicyholders();
  }, [currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPolicyholders();
  };

  const handleCreatePolicyholder = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setModalError('Full Name, Phone, and Residential Address are mandatory.');
      return;
    }

    setModalLoading(true);
    try {
      const res = await policyholdersAPI.create(formData);
      if (res.success) {
        setShowAddModal(false);
        setSuccessMsg('Policyholder record created successfully.');
        fetchPolicyholders();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to create policyholder.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this policyholder?')) return;
    try {
      const res = await policyholdersAPI.delete(id);
      if (res.success) {
        setSuccessMsg('Policyholder deleted successfully.');
        fetchPolicyholders();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete policyholder.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Policyholders</h1>
          <p className="text-sm text-slate-500">
            Registered insurance customer profiles, demographics, and contact records
          </p>
        </div>

        <button
          onClick={() => {
            setModalError(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Add Policyholder
        </button>
      </div>

      {successMsg && <FeedbackAlert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />}
      {error && <FeedbackAlert type="error" message={error} onDismiss={() => setError(null)} />}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search policyholders by name, phone, address, occupation..."
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
      </div>

      {/* Policyholder Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching policyholders..." />
      ) : policyholders.length === 0 ? (
        <EmptyState
          title="No Policyholders Found"
          description={search ? 'No records match your query.' : 'No policyholder records have been added yet.'}
          actionLabel="Add Policyholder"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {policyholders.map((ph) => (
            <div key={ph._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{ph.fullName}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" /> {ph.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                    {ph.gender}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(ph._id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Occupation</span>
                  <span className="font-medium text-slate-800">{ph.occupation || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Annual Income</span>
                  <span className="font-medium text-slate-800">₹{ph.annualIncome?.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Active Policies</span>
                  <span className="font-medium text-blue-600">{ph.totalPolicies || 0} enrolled</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                  <span className="font-medium text-slate-800">{ph.dateOfBirth?.split('T')[0]}</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate">{ph.address}</span>
                </p>
                <p className="text-[11px] text-slate-400 pl-5">
                  Emergency: {ph.emergencyContact}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={totalRecords}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Add Policyholder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Register Policyholder Record</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-3">
                <FeedbackAlert type="error" message={modalError} onDismiss={() => setModalError(null)} />
              </div>
            )}

            <form onSubmit={handleCreatePolicyholder} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Meenakshi Sundaram"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Annual Income (₹)</label>
                  <input
                    type="number"
                    value={formData.annualIncome}
                    onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Residential Address *</label>
                <textarea
                  rows="2"
                  placeholder="Street, locality, city, state and PIN code"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Emergency Contact *</label>
                <input
                  type="text"
                  placeholder="e.g. +91 99999 11111 (Kavita - Spouse)"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {modalLoading ? 'Saving...' : 'Register Policyholder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
