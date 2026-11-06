import React, { useState } from 'react';
import { authAPI } from '../api.js';
import FeedbackAlert from '../components/FeedbackAlert.jsx';
import {
  BookOpenCheck,
  Download,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  FileCode,
  Layers,
  Server,
  Globe,
  Database
} from 'lucide-react';

export default function ProjectDocs() {
  const [resetMsg, setResetMsg] = useState(null);
  const [resetError, setResetError] = useState(null);
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    if (!window.confirm('Reset all demo data back to fresh seeded college lab records?')) return;
    setResetting(true);
    setResetMsg(null);
    setResetError(null);
    try {
      const res = await authAPI.resetDemoDb();
      if (res.success) {
        setResetMsg(res.message);
      }
    } catch (err) {
      setResetError(err.message || 'Failed to reset demo data.');
    } finally {
      setResetting(false);
    }
  };

  const apiEndpoints = [
    { method: 'POST', path: '/api/auth/register', role: 'Public', desc: 'Register new user account (hashes password with bcrypt)' },
    { method: 'POST', path: '/api/auth/login', role: 'Public', desc: 'Authenticate and receive signed JWT token' },
    { method: 'GET', path: '/api/auth/me', role: 'Authenticated', desc: 'Get logged in user profile & policyholder link' },
    { method: 'GET', path: '/api/users', role: 'Admin', desc: 'Get all users with search, pagination, and role filter' },
    { method: 'GET', path: '/api/users/officers', role: 'Admin / Officer', desc: 'List claim investigation officers for assignment' },
    { method: 'GET', path: '/api/policyholders', role: 'Authenticated', desc: 'Get policyholders (filtered for user or all for admin)' },
    { method: 'POST', path: '/api/policyholders', role: 'Authenticated', desc: 'Create new policyholder demographic record' },
    { method: 'GET', path: '/api/policies', role: 'Authenticated', desc: 'List policies with type filter (Health, Auto, Home, Life)' },
    { method: 'POST', path: '/api/policies', role: 'Admin / Officer', desc: 'Issue new insurance policy for a policyholder' },
    { method: 'GET', path: '/api/claims', role: 'Authenticated', desc: 'List claims with search, status filters & pagination' },
    { method: 'GET', path: '/api/claims/:id', role: 'Authenticated', desc: 'Get complete claim dossier (docs, reviews, settlement)' },
    { method: 'POST', path: '/api/claims', role: 'Authenticated', desc: 'Submit claim with incident details & initial document' },
    { method: 'PUT', path: '/api/claims/:id/assign', role: 'Admin', desc: 'Assign Claim Officer to investigate claim' },
    { method: 'PUT', path: '/api/claims/:id/status', role: 'Admin / Officer', desc: 'Update claim status with remarks' },
    { method: 'POST', path: '/api/documents', role: 'Authenticated', desc: 'Attach bills, damage photos, or police reports' },
    { method: 'POST', path: '/api/reviews', role: 'Admin / Officer', desc: 'Submit investigation findings & recommendation' },
    { method: 'POST', path: '/api/settlements', role: 'Admin', desc: 'Disburse financial payout (NEFT, UPI, Cheque)' },
    { method: 'GET', path: '/api/reports/summary', role: 'Authenticated', desc: 'Executive statistics and status distribution metrics' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-widest mb-1">
            <BookOpenCheck className="w-4 h-4" />
            College Project #29 Internal Mark Evaluation Package
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Project Documentation & Submission</h1>
          <p className="text-sm text-slate-300 mt-1">
            Insurance Claim Management System • Postman API Suite, Demo Accounts & Requirements Verification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Postman Collection Download */}
          <a
            href="/insurance_claim_postman_collection.json"
            download="insurance_claim_postman_collection.json"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download Postman JSON
          </a>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            {resetting ? 'Resetting...' : 'Reset Demo Records'}
          </button>
        </div>
      </div>

      {resetMsg && <FeedbackAlert type="success" message={resetMsg} onDismiss={() => setResetMsg(null)} />}
      {resetError && <FeedbackAlert type="error" message={resetError} onDismiss={() => setResetError(null)} />}

      {/* Pre-configured Demo Credentials */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <KeyRound className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-base">Preloaded Demo Credentials</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800">1. Administrator</span>
              <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded font-mono font-bold">Admin</span>
            </div>
            <div className="text-xs space-y-1 font-mono text-slate-700">
              <p>Email: <strong>admin@insurance.edu</strong></p>
              <p>Password: <strong>Admin@123</strong></p>
            </div>
            <p className="text-[11px] text-purple-700 pt-1">
              Capabilities: Officer assignment, payout disbursements, user management, and full reporting.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">2. Claim Officer</span>
              <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">Claim Officer</span>
            </div>
            <div className="text-xs space-y-1 font-mono text-slate-700">
              <p>Email: <strong>officer@insurance.edu</strong></p>
              <p>Password: <strong>Officer@123</strong></p>
            </div>
            <p className="text-[11px] text-amber-700 pt-1">
              Capabilities: Field inspections, bill audits, recording reviews, and recommendations.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">3. Policyholder</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">Policyholder</span>
            </div>
            <div className="text-xs space-y-1 font-mono text-slate-700">
              <p>Email: <strong>policyholder@insurance.edu</strong></p>
              <p>Password: <strong>User@123</strong></p>
            </div>
            <p className="text-[11px] text-emerald-700 pt-1">
              Capabilities: View policies, file claims with supporting bills, and track settlements.
            </p>
          </div>
        </div>
      </div>

      {/* Checklist of Project Requirements from Image */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base pb-2 border-b border-slate-100">
          Required Functional Work Compliance Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { req: '1. Authentication', desc: 'Registration, login, logout, JWT-protected APIs and bcrypt password hashing.' },
            { req: '2. Role Access', desc: '3 distinct roles: Admin, Claim Officer, and Policyholder with route and action protection.' },
            { req: '3. Core Workflow', desc: 'Maintain policies, file claims with documents, assign officers, reviews, approve/reject, settlements.' },
            { req: '4. Data Management', desc: 'CRUD screens and Express APIs for User, Policyholder, Policy, Claim, ClaimDocument, Review, Settlement.' },
            { req: '5. List Features', desc: 'Live search, status & policy type filters, sorting, and pagination across main collections.' },
            { req: '6. Validation', desc: 'Validated required fields in React forms (e.preventDefault) and again in Express APIs with 400 status.' },
            { req: '7. Feedback States', desc: 'Loading spinners, empty states, success badges, and error alert banners for all API operations.' },
            { req: '8. Reports', desc: 'Summary metrics, financial outlay, settlement ratios, status distributions, and printable report export.' }
          ].map((item) => (
            <div key={item.req} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">{item.req}</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Express APIs Reference Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-base">Express Backend Endpoints Reference</h3>
          <p className="text-xs text-slate-500 mt-0.5">Separate routers, controllers, middlewares and database files</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-2.5">Method</th>
                <th className="px-5 py-2.5">Endpoint Path</th>
                <th className="px-5 py-2.5">Access Level</th>
                <th className="px-5 py-2.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apiEndpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-5 py-2 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' :
                      ep.method === 'PUT' ? 'bg-amber-100 text-amber-800' :
                      ep.method === 'DELETE' ? 'bg-rose-100 text-rose-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-5 py-2 text-slate-900 font-semibold">{ep.path}</td>
                  <td className="px-5 py-2 text-slate-600">{ep.role}</td>
                  <td className="px-5 py-2 text-slate-500 font-sans">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
