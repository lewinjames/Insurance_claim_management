import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { claimsAPI, documentsAPI, reviewsAPI, settlementsAPI, usersAPI } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import FeedbackAlert from '../components/FeedbackAlert.jsx';
import {
  FileCheck2,
  ArrowLeft,
  UserCheck,
  FileText,
  FileSearch,
  BadgeDollarSign,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Download,
  ExternalLink,
  CreditCard,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function ClaimDetail() {
  const { id } = useParams();
  const { user, isAdmin, isOfficer } = useAuth();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Officers list for assignment modal
  const [officers, setOfficers] = useState([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');

  // Review form
  const [reviewNotes, setReviewNotes] = useState('');
  const [recommendation, setRecommendation] = useState('Approve');
  const [reviewedAmount, setReviewedAmount] = useState('');

  // Settlement form
  const [settlementAmount, setSettlementAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [transactionId, setTransactionId] = useState('');

  // Document form
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Medical Bill');
  const [docUrl, setDocUrl] = useState('');
  const [docRemarks, setDocRemarks] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Fetch claim dossier
  const loadClaimDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await claimsAPI.getById(id);
      if (res.success && res.claim) {
        setClaim(res.claim);
        setReviewedAmount(res.claim.claimAmount);
        setSettlementAmount(res.claim.claimAmount);
      } else {
        setError('Claim not found.');
      }
    } catch (err) {
      setError(err.message || 'Error loading claim dossier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaimDetails();
  }, [id]);

  // Open Assign Modal
  const handleOpenAssignModal = async () => {
    setActionError(null);
    setShowAssignModal(true);
    try {
      const res = await usersAPI.getOfficers();
      if (res.success && res.officers.length > 0) {
        setOfficers(res.officers);
        setSelectedOfficerId(claim.assignedOfficer?._id || res.officers[0]._id);
      }
    } catch (err) {
      setActionError('Failed to fetch officer list.');
    }
  };

  // Submit Officer Assignment
  const handleAssignOfficer = async (e) => {
    e.preventDefault();
    if (!selectedOfficerId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await claimsAPI.assignOfficer(claim._id, selectedOfficerId);
      if (res.success) {
        setShowAssignModal(false);
        setSuccessMsg(res.message);
        loadClaimDetails();
      }
    } catch (err) {
      setActionError(err.message || 'Assignment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Officer Review
  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!reviewNotes.trim()) {
      setActionError('Please enter review notes/findings.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await reviewsAPI.create({
        claimId: claim._id,
        reviewNotes,
        recommendation,
        reviewedAmount: Number(reviewedAmount) || 0
      });
      if (res.success) {
        setShowReviewModal(false);
        setSuccessMsg(res.message);
        setReviewNotes('');
        loadClaimDetails();
      }
    } catch (err) {
      setActionError(err.message || 'Failed to submit review.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Settlement Disbursement
  const handleCreateSettlement = async (e) => {
    e.preventDefault();
    if (!settlementAmount || Number(settlementAmount) <= 0) {
      setActionError('Please enter a valid settlement amount.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await settlementsAPI.create({
        claimId: claim._id,
        settlementAmount: Number(settlementAmount),
        paymentMode,
        transactionId: transactionId.trim() || undefined,
        status: 'Paid'
      });
      if (res.success) {
        setShowSettlementModal(false);
        setSuccessMsg(res.message);
        loadClaimDetails();
      }
    } catch (err) {
      setActionError(err.message || 'Settlement failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Document Upload
  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docName.trim()) {
      setActionError('Document name is required.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await documentsAPI.create({
        claimId: claim._id,
        documentName: docName.trim(),
        documentType: docType,
        fileUrl: docUrl.trim() || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
        remarks: docRemarks.trim()
      });
      if (res.success) {
        setShowDocModal(false);
        setSuccessMsg('Document successfully attached to claim dossier.');
        setDocName('');
        setDocRemarks('');
        loadClaimDetails();
      }
    } catch (err) {
      setActionError(err.message || 'Failed to attach document.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Fetching complete claim dossier..." />;
  }

  if (error || !claim) {
    return (
      <div className="space-y-4">
        <Link to="/claims" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Claims
        </Link>
        <FeedbackAlert type="error" message={error || 'Claim record not found.'} />
      </div>
    );
  }

  // Determine active workflow step (1 to 4)
  const getStepIndex = () => {
    if (claim.status === 'Settled') return 4;
    if (claim.status === 'Approved' || claim.status === 'Rejected') return 3;
    if (claim.status === 'Under Review' || claim.assignedOfficer) return 2;
    return 1;
  };

  const currentStep = getStepIndex();

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/claims"
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-slate-900">{claim.claimNumber}</h1>
              <StatusBadge status={claim.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Filed on {new Date(claim.submittedAt).toLocaleDateString()} • {claim.policy?.policyType} Insurance
            </p>
          </div>
        </div>

        {/* Workflow Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Admin can assign officer */}
          {isAdmin && (
            <button
              onClick={handleOpenAssignModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-purple-600" />
              {claim.assignedOfficer ? 'Reassign Officer' : 'Assign Claim Officer'}
            </button>
          )}

          {/* Officer or Admin can submit review */}
          {(isAdmin || isOfficer) && claim.status !== 'Settled' && (
            <button
              onClick={() => {
                setActionError(null);
                setShowReviewModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <FileSearch className="w-4 h-4" />
              Record Officer Review
            </button>
          )}

          {/* Admin can disburse settlement if claim is Approved */}
          {isAdmin && claim.status === 'Approved' && (
            <button
              onClick={() => {
                setActionError(null);
                setShowSettlementModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <BadgeDollarSign className="w-4 h-4" />
              Disburse Settlement
            </button>
          )}
        </div>
      </div>

      {successMsg && <FeedbackAlert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />}

      {/* 4-Step Interactive Workflow Pipeline Tracker */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Claim Resolution Lifecycle
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {/* Step 1: Submission */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            currentStep >= 1 ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-blue-600">01. SUBMISSION</span>
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs font-semibold text-slate-900">Claim Registered</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Amount: ₹{claim.claimAmount?.toLocaleString('en-IN')}</p>
          </div>

          {/* Step 2: Officer Assignment */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            currentStep >= 2 ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-600">02. INVESTIGATION</span>
              {currentStep >= 2 ? <CheckCircle className="w-4 h-4 text-amber-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
            </div>
            <p className="text-xs font-semibold text-slate-900">
              {claim.assignedOfficer?.name || 'Awaiting Assignment'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Field assessment & bill audits</p>
          </div>

          {/* Step 3: Officer Review Decision */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            currentStep >= 3 ? (claim.status === 'Rejected' ? 'bg-rose-50/50 border-rose-200' : 'bg-emerald-50/50 border-emerald-200') : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-mono font-bold ${claim.status === 'Rejected' ? 'text-rose-600' : 'text-emerald-600'}`}>03. VERDICT</span>
              {currentStep >= 3 ? (
                claim.status === 'Rejected' ? <XCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : <Clock className="w-4 h-4 text-slate-400" />}
            </div>
            <p className="text-xs font-semibold text-slate-900">
              {claim.status === 'Approved' ? 'Approved for Payout' : claim.status === 'Rejected' ? 'Claim Rejected' : 'Under Assessment'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {claim.reviews?.length || 0} officer reviews logged
            </p>
          </div>

          {/* Step 4: Settlement Payout */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            currentStep >= 4 ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-purple-600">04. SETTLEMENT</span>
              {currentStep >= 4 ? <CheckCircle className="w-4 h-4 text-purple-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
            </div>
            <p className="text-xs font-semibold text-slate-900">
              {claim.settlement ? `Settled: ₹${claim.settlement.settlementAmount?.toLocaleString('en-IN')}` : 'Pending Disbursement'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
              {claim.settlement?.transactionId || 'No tx ref yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Dossier / Right Documents & Review Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Policy details & Claim Incident details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Incident Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Incident & Loss Details</h3>
              <span className="text-xs text-slate-400 font-mono">ID: {claim._id}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500">Incident Date</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {claim.incidentDate?.split('T')[0]}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Claim Requested</p>
                <p className="text-sm font-bold text-blue-600 mt-0.5">
                  ₹{claim.claimAmount?.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Current Status</p>
                <div className="mt-0.5">
                  <StatusBadge status={claim.status} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Reason / Loss Summary</p>
              <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-800 font-medium">
                {claim.reason}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Detailed Incident Narrative</p>
              <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed">
                {claim.description}
              </div>
            </div>
          </div>

          {/* Associated Policy & Policyholder Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
              Covered Policy & Policyholder Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Policy details */}
              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-blue-800">
                    {claim.policy?.policyNumber}
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                    {claim.policy?.policyType}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{claim.policy?.policyName}</h4>
                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <p>Max Coverage: <strong className="text-slate-900">₹{claim.policy?.coverageAmount?.toLocaleString('en-IN')}</strong></p>
                  <p>Annual Premium: ₹{claim.policy?.premiumAmount?.toLocaleString('en-IN')}</p>
                  <p>Valid: {claim.policy?.startDate} to {claim.policy?.endDate}</p>
                </div>
              </div>

              {/* Policyholder details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Policyholder Details</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                    {claim.policyholder?.gender}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{claim.policyholder?.fullName}</h4>
                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <p>Phone: <span className="font-mono">{claim.policyholder?.phone}</span></p>
                  <p>Occupation: {claim.policyholder?.occupation}</p>
                  <p className="truncate">Address: {claim.policyholder?.address}</p>
                  <p className="truncate text-slate-500">Emergency: {claim.policyholder?.emergencyContact}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Official Investigation Reviews Log (Mongoose Review Collection) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Claim Officer Reviews & Audit Trail</h3>
                <p className="text-xs text-slate-500">Mongoose Review collection records</p>
              </div>
              {(isAdmin || isOfficer) && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  + Add Review
                </button>
              )}
            </div>

            {claim.reviews?.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3">
                No formal investigation reviews have been logged yet for this claim.
              </p>
            ) : (
              <div className="space-y-3">
                {claim.reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-800">{rev.officerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          rev.recommendation === 'Approve'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rev.recommendation === 'Reject'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          Verdict: {rev.recommendation}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(rev.reviewDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{rev.reviewNotes}</p>
                    <div className="text-xs text-slate-500 pt-1 font-mono">
                      Eligible Settlement Amount Assessed: <strong>₹{rev.reviewedAmount?.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Supporting Documents & Settlement Card */}
        <div className="space-y-6">
          {/* Assigned Officer Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Assigned Investigation Officer
            </h4>

            {claim.assignedOfficer ? (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs">
                    {claim.assignedOfficer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{claim.assignedOfficer.name}</p>
                    <p className="text-xs text-slate-500">{claim.assignedOfficer.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 flex items-center justify-between">
                <span>No officer assigned yet.</span>
                {isAdmin && (
                  <button
                    onClick={handleOpenAssignModal}
                    className="font-bold text-amber-900 underline"
                  >
                    Assign Now
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Attached Claim Documents (Mongoose ClaimDocument Collection) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Supporting Documents
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">ClaimDocument collection</span>
              </div>
              <button
                onClick={() => {
                  setActionError(null);
                  setShowDocModal(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Attach
              </button>
            </div>

            {claim.documents?.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No documents uploaded yet. Attach bills or damage photos.
              </div>
            ) : (
              <div className="space-y-2">
                {claim.documents.map((doc) => (
                  <div key={doc._id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                        {doc.documentType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate" title={doc.documentName}>
                      {doc.documentName}
                    </p>
                    {doc.remarks && (
                      <p className="text-[11px] text-slate-500 italic">{doc.remarks}</p>
                    )}
                    <div className="pt-1">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-3 h-3" /> Preview Document
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Final Settlement Record (Mongoose Settlement Collection) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Disbursement Settlement
            </h4>

            {claim.settlement ? (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-700">
                    {claim.settlement.paymentMode}
                  </span>
                  <StatusBadge status={claim.settlement.status} type="settlement" />
                </div>
                <div className="text-xl font-bold text-slate-900">
                  ₹{claim.settlement.settlementAmount?.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-600 space-y-1 pt-1 font-mono">
                  <p>Ref Tx: {claim.settlement.transactionId}</p>
                  <p>Date: {claim.settlement.settlementDate}</p>
                  <p>Processed By: {claim.settlement.processorName || 'Admin'}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 text-center">
                {claim.status === 'Approved' ? (
                  isAdmin ? (
                    <div>
                      <p className="text-slate-800 font-medium mb-2">Claim is Approved! Ready for disbursement.</p>
                      <button
                        onClick={() => setShowSettlementModal(true)}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg text-xs hover:bg-emerald-700 transition"
                      >
                        Process Payout
                      </button>
                    </div>
                  ) : (
                    'Claim is Approved. Admin is processing the financial disbursement.'
                  )
                ) : (
                  'Settlement will be initiated once claim investigation is Approved.'
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Assign Officer (Admin Only) */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Assign Claim Officer</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select an investigation officer from the Claim Officer pool.
            </p>

            {actionError && <FeedbackAlert type="error" message={actionError} onDismiss={() => setActionError(null)} />}

            <form onSubmit={handleAssignOfficer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Officer</label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {officers.map((off) => (
                    <option key={off._id} value={off._id}>
                      {off.name} ({off.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Officer Review */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Officer Assessment & Review</h3>
            <p className="text-xs text-slate-500 mb-4">
              Record inspection findings, eligible amount, and official recommendation.
            </p>

            {actionError && <FeedbackAlert type="error" message={actionError} onDismiss={() => setActionError(null)} />}

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Recommendation *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Approve', 'Request More Info', 'Reject'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setRecommendation(opt)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition text-center ${
                        recommendation === opt
                          ? opt === 'Approve'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : opt === 'Reject'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Assessed Eligible Amount (₹) *
                </label>
                <input
                  type="number"
                  value={reviewedAmount}
                  onChange={(e) => setReviewedAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Investigation Notes & Rationale *
                </label>
                <textarea
                  rows="3"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Detail policy clause adherence, deductible caps, surveyor verification..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  {actionLoading ? 'Recording...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Disburse Settlement (Admin) */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Disburse Claim Settlement</h3>
            <p className="text-xs text-slate-500 mb-4">
              Authorize fund release to the policyholder via electronic transfer.
            </p>

            {actionError && <FeedbackAlert type="error" message={actionError} onDismiss={() => setActionError(null)} />}

            <form onSubmit={handleCreateSettlement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Settlement Amount (₹) *</label>
                <input
                  type="number"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Payment Mode *</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI Instant Transfer</option>
                  <option value="Cheque">Physical Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Transaction Ref ID</label>
                <input
                  type="text"
                  placeholder="Leave blank to auto-generate reference ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettlementModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Upload/Attach Document */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Attach Supporting Document</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add bill invoice, repair estimate, police GD entry, or incident photograph.
            </p>

            {actionError && <FeedbackAlert type="error" message={actionError} onDismiss={() => setActionError(null)} />}

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Document Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apollo_Discharge_Summary.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category *</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Medical Bill">Medical Bill</option>
                  <option value="Police Report">Police Report</option>
                  <option value="Damage Photo">Damage Photo</option>
                  <option value="Invoice">Invoice</option>
                  <option value="ID Proof">ID Proof</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Document URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Verified with original stamped copy"
                  value={docRemarks}
                  onChange={(e) => setDocRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  {actionLoading ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
