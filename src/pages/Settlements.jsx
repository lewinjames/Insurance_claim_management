import React, { useState, useEffect } from 'react';
import { settlementsAPI } from '../api.js';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FeedbackAlert from '../components/FeedbackAlert.jsx';
import Pagination from '../components/Pagination.jsx';
import {
  BadgeDollarSign,
  Filter,
  CreditCard,
  Building,
  Smartphone,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function Settlements() {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchSettlements = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: 8,
        ...(paymentModeFilter && { paymentMode: paymentModeFilter }),
        ...(statusFilter && { status: statusFilter })
      }).toString();

      const res = await settlementsAPI.getAll(query);
      if (res.success) {
        setSettlements(res.settlements || []);
        setTotalPages(res.totalPages || 1);
        setTotalRecords(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch settlements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [currentPage, paymentModeFilter, statusFilter]);

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'UPI':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Bank Transfer':
        return <Building className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Settlements</h1>
          <p className="text-sm text-slate-500">
            Disbursement tracking, payment methods, and transaction reference ledger
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={paymentModeFilter}
            onChange={(e) => {
              setPaymentModeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Payment Modes</option>
            <option value="Bank Transfer">Bank Transfer (NEFT)</option>
            <option value="UPI">UPI</option>
            <option value="Cheque">Cheque</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid / Cleared</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {error && <FeedbackAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching settlement ledger..." />
        ) : settlements.length === 0 ? (
          <EmptyState
            title="No Settlements Found"
            description="No settlements match your filter criteria or have been paid yet."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Transaction ID</th>
                    <th className="px-6 py-3">Claim Reference</th>
                    <th className="px-6 py-3">Beneficiary</th>
                    <th className="px-6 py-3">Settlement Amount</th>
                    <th className="px-6 py-3">Disbursement Mode</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settlements.map((set) => (
                    <tr key={set._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono font-semibold text-purple-700">
                        {set.transactionId}
                      </td>
                      <td className="px-6 py-4 font-mono text-blue-600 font-medium">
                        {set.claimNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 font-medium">{set.policyholderName}</div>
                        <div className="text-xs text-slate-400">{set.policyholderPhone}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{set.settlementAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {getModeIcon(set.paymentMode)}
                          {set.paymentMode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {set.settlementDate}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={set.status} type="settlement" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/claims/${set.claimId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Claim
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
    </div>
  );
}
