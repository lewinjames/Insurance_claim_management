import React, { useState } from 'react';
import { Database, Link2, Key, Info, CheckCircle2 } from 'lucide-react';

export default function ERDiagram() {
  const [selectedModel, setSelectedModel] = useState(null);

  // The 7 Mongoose Models explicitly specified in Project #29
  const models = [
    {
      name: 'User',
      color: 'border-purple-300 bg-purple-50/50 text-purple-950',
      badgeColor: 'bg-purple-600 text-white',
      description: 'System authentication & role access control (Admin, Claim Officer, Policyholder)',
      fields: [
        { name: '_id', type: 'ObjectId', isKey: true, desc: 'Primary Key' },
        { name: 'name', type: 'String', req: true, desc: 'Full Name' },
        { name: 'email', type: 'String', req: true, desc: 'Unique Email (Index)' },
        { name: 'password', type: 'String', req: true, desc: 'Bcrypt Hashed Password' },
        { name: 'role', type: 'String (Enum)', req: true, desc: 'Admin | Claim Officer | Policyholder' },
        { name: 'phone', type: 'String', desc: 'Contact Number' },
        { name: 'createdAt', type: 'Date', desc: 'Timestamp' }
      ],
      relations: [
        '1:1 with Policyholder (userId)',
        '1:N with Claim as Assigned Officer (assignedOfficerId)',
        '1:N with Review as Reviewing Officer (officerId)',
        '1:N with Settlement as Disbursing Admin (processedBy)'
      ]
    },
    {
      name: 'Policyholder',
      color: 'border-emerald-300 bg-emerald-50/50 text-emerald-950',
      badgeColor: 'bg-emerald-600 text-white',
      description: 'Customer profile details, occupation, and family contact records',
      fields: [
        { name: '_id', type: 'ObjectId', isKey: true, desc: 'Primary Key' },
        { name: 'userId', type: 'ObjectId (ref: User)', req: true, isFk: true, desc: 'FK -> User._id' },
        { name: 'fullName', type: 'String', req: true, desc: 'Full Name' },
        { name: 'dateOfBirth', type: 'Date', req: true, desc: 'Birth Date' },
        { name: 'gender', type: 'String (Enum)', req: true, desc: 'Male | Female | Other' },
        { name: 'address', type: 'String', req: true, desc: 'Residential Address' },
        { name: 'phone', type: 'String', req: true, desc: 'Contact Phone' },
        { name: 'emergencyContact', type: 'String', req: true, desc: 'Emergency Contact' },
        { name: 'occupation', type: 'String', desc: 'Employment Sector' },
        { name: 'annualIncome', type: 'Number', req: true, desc: 'Annual Gross Income' }
      ],
      relations: [
        'N:1 with User (userId)',
        '1:N with Policy (policyholderId)',
        '1:N with Claim (policyholderId)'
      ]
    },
    {
      name: 'Policy',
      color: 'border-blue-300 bg-blue-50/50 text-blue-950',
      badgeColor: 'bg-blue-600 text-white',
      description: 'Insurance coverage terms, policy types, premium amounts, and validity dates',
      fields: [
        { name: '_id', type: 'ObjectId', isKey: true, desc: 'Primary Key' },
        { name: 'policyNumber', type: 'String', req: true, desc: 'Unique Policy Code (e.g. POL-HLTH-2026-081)' },
        { name: 'policyholderId', type: 'ObjectId (ref: Policyholder)', req: true, isFk: true, desc: 'FK -> Policyholder._id' },
        { name: 'policyName', type: 'String', req: true, desc: 'Marketing Plan Name' },
        { name: 'policyType', type: 'String (Enum)', req: true, desc: 'Health | Auto | Home | Life' },
        { name: 'coverageAmount', type: 'Number', req: true, desc: 'Max Sum Insured' },
        { name: 'premiumAmount', type: 'Number', req: true, desc: 'Annual Premium' },
        { name: 'startDate', type: 'Date', req: true, desc: 'Commencement Date' },
        { name: 'endDate', type: 'Date', req: true, desc: 'Expiration Date' },
        { name: 'status', type: 'String (Enum)', desc: 'Active | Expired | Terminated' }
      ],
      relations: [
        'N:1 with Policyholder (policyholderId)',
        '1:N with Claim (policyId)'
      ]
    },
    {
      name: 'Claim',
      color: 'border-amber-300 bg-amber-50/50 text-amber-950',
      badgeColor: 'bg-amber-600 text-white',
      description: 'Core central entity: damage incidents, claimed amounts, and status workflow',
      fields: [
        { name: '_id', type: 'ObjectId', isKey: true, desc: 'Primary Key' },
        { name: 'claimNumber', type: 'String', req: true, desc: 'Unique Claim Code (e.g. CLM-2026-001)' },
        { name: 'policyId', type: 'ObjectId (ref: Policy)', req: true, isFk: true, desc: 'FK -> Policy._id' },
        { name: 'policyholderId', type: 'ObjectId (ref: Policyholder)', req: true, isFk: true, desc: 'FK -> Policyholder._id' },
        { name: 'incidentDate', type: 'Date', req: true, desc: 'Date of Loss' },
        { name: 'claimAmount', type: 'Number', req: true, desc: 'Claim Amount Requested' },
        { name: 'reason', type: 'String', req: true, desc: 'Cause of Claim' },
        { name: 'description', type: 'String', req: true, desc: 'Detailed Narrative' },
        { name: 'status', type: 'String (Enum)', req: true, desc: 'Submitted | Under Review | Approved | Rejected | Settled' },
        { name: 'assignedOfficerId', type: 'ObjectId (ref: User)', isFk: true, desc: 'FK -> User._id (Claim Officer)' },
        { name: 'submittedAt', type: 'Date', desc: 'Submission Timestamp' }
      ],
      relations: [
        'N:1 with Policy (policyId)',
        'N:1 with Policyholder (policyholderId)',
        'N:1 with User (assignedOfficerId)',
        '1:N with ClaimDocument (claimId)',
        '1:N with Review (claimId)',
        '1:1 with Settlement (claimId)'
      ]
    },
    {
      name: 'ClaimDocument',
      color: 'border-cyan-300 bg-cyan-50/50 text-cyan-950',
      badgeColor: 'bg-cyan-600 text-white',
      description: 'Supporting evidence: hospital bills, damage photos, police reports, and estimates',
      fields: [
        { name: '_id', type: 'ObjectId', isKey: true, desc: 'Primary Key' },
        { name: 'claimId', type: 'ObjectId (ref: Claim)', req: true, isFk: true, desc: 'FK -> Claim._id' },
        { name: 'documentName', type: 'String', req: true, desc: 'Filename / Title' },
        { name: 'documentType', type: 'String (Enum)', req: true, desc: 'Medical Bill | Police Report | Damage Photo | Invoice | ID Proof' },
        { name: 'fileUrl', type: 'String', req: true, desc: 'File URL / Cloud Storage Path' },
        { name: 'remarks', type: 'String', desc: 'Officer notes / verification remarks' },
        { name: 'uploadedAt', type: 'Date', desc: 'Upload Timestamp' }
      ],
      relations: [
        'N:1 with Claim (claimId)'
      ]
    },
    {
      name: 'Review',
      color: 'border-orange-300 bg-orange-50/50 text-orange-950',
      badgeColor: 'bg-orange-600 text-white',
      description: 'Formal officer investigation, assessed eligible payout amount, and audit recommendations',
      fields: [
        { name: '_id', type: 'ObjectId', isKey: true, desc: 'Primary Key' },
        { name: 'claimId', type: 'ObjectId (ref: Claim)', req: true, isFk: true, desc: 'FK -> Claim._id' },
        { name: 'officerId', type: 'ObjectId (ref: User)', req: true, isFk: true, desc: 'FK -> User._id' },
        { name: 'reviewNotes', type: 'String', req: true, desc: 'Detailed Inspection Findings' },
        { name: 'recommendation', type: 'String (Enum)', req: true, desc: 'Approve | Reject | Request More Info' },
        { name: 'reviewedAmount', type: 'Number', req: true, desc: 'Assessed Approved Amount' },
        { name: 'reviewDate', type: 'Date', desc: 'Review Timestamp' }
      ],
      relations: [
        'N:1 with Claim (claimId)',
        'N:1 with User (officerId)'
      ]
    },
    {
      name: 'Settlement',
      color: 'border-violet-300 bg-violet-50/50 text-violet-950',
      badgeColor: 'bg-violet-600 text-white',
      description: 'Financial disbursement transactions, bank references, and payout tracking',
      fields: [
        { name: '_id', type: 'ObjectId', isKey: true, desc: 'Primary Key' },
        { name: 'claimId', type: 'ObjectId (ref: Claim)', req: true, isFk: true, desc: 'FK -> Claim._id' },
        { name: 'settlementAmount', type: 'Number', req: true, desc: 'Disbursed Amount (₹)' },
        { name: 'paymentMode', type: 'String (Enum)', req: true, desc: 'Bank Transfer | Cheque | UPI' },
        { name: 'transactionId', type: 'String', req: true, desc: 'Unique Bank/UPI Reference No.' },
        { name: 'settlementDate', type: 'Date', desc: 'Disbursement Date' },
        { name: 'status', type: 'String (Enum)', desc: 'Pending | Paid | Failed' },
        { name: 'processedBy', type: 'ObjectId (ref: User)', req: true, isFk: true, desc: 'FK -> User._id (Admin)' }
      ],
      relations: [
        '1:1 with Claim (claimId)',
        'N:1 with User (processedBy)'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-widest mb-1">
          <Database className="w-4 h-4" />
          Database Schema Architecture • Project #29
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Entity-Relationship (ER) Schema Diagram
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Visual documentation of all <strong>7 Mongoose Models</strong> mandated in the specification:
          <span className="font-mono text-blue-300"> User, Policyholder, Policy, Claim, ClaimDocument, Review, Settlement</span>.
        </p>
      </div>

      {/* Relational Mapping Flowchart Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Relational Flow & Cardinality Overview
        </h3>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 overflow-x-auto whitespace-pre leading-relaxed">
{`┌──────────────┐          1 : N          ┌────────────────────┐          1 : N          ┌───────────────┐
│     User     │ ──────────────────────> │    Policyholder    │ ──────────────────────> │    Policy     │
│  (Auth/Role) │                         │ (Customer Profile) │                         │  (Terms/Cover)│
└──────────────┘                         └────────────────────┘                         └───────────────┘
       │                                            │                                           │
       │ 1:N (Assigned Officer)                     │ 1:N                                       │ 1:N
       ▼                                            ▼                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                Claim                                                  │
│                       (Incident Date, Amount Requested, Reason, Workflow Status)                      │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
       │                                            │                                           │
       │ 1 : N                                      │ 1 : N                                     │ 1 : 1
       ▼                                            ▼                                           ▼
┌──────────────┐                         ┌────────────────────┐                         ┌───────────────┐
│ClaimDocument │                         │       Review       │                         │  Settlement   │
│ (Bills/Docs) │                         │ (Officer Findings) │                         │(Payout/BankTx)│
└──────────────┘                         └────────────────────┘                         └───────────────┘`}
        </div>
      </div>

      {/* Grid of the 7 Mongoose Entity Schemas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {models.map((model) => (
          <div
            key={model.name}
            onClick={() => setSelectedModel(selectedModel === model.name ? null : model.name)}
            className={`bg-white rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
              selectedModel === model.name
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Model Card Header */}
            <div className={`p-4 rounded-t-2xl border-b ${model.color} flex items-center justify-between`}>
              <div>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${model.badgeColor}`}>
                  Mongoose Model
                </span>
                <h3 className="text-lg font-bold mt-1 text-slate-900">{model.name}</h3>
              </div>
              <span className="text-xs font-mono font-semibold bg-white/80 px-2 py-1 rounded border border-slate-200 text-slate-700">
                {model.fields.length} Fields
              </span>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">{model.description}</p>

              {/* Fields Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-1.5">Field</th>
                      <th className="px-3 py-1.5">Type</th>
                      <th className="px-3 py-1.5 text-right">Key</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {model.fields.map((f) => (
                      <tr key={f.name} className="hover:bg-slate-50/60">
                        <td className="px-3 py-1.5 font-semibold text-slate-900">
                          {f.name}
                          {f.req && <span className="text-rose-500 ml-0.5">*</span>}
                        </td>
                        <td className="px-3 py-1.5 text-slate-600 text-[11px] truncate max-w-[120px]" title={f.type}>
                          {f.type}
                        </td>
                        <td className="px-3 py-1.5 text-right text-[10px]">
                          {f.isKey && (
                            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">PK</span>
                          )}
                          {f.isFk && (
                            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">FK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Relationships */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Foreign Key Mappings:
                </span>
                {model.relations.map((rel, idx) => (
                  <p key={idx} className="text-[11px] text-slate-700 font-mono flex items-center gap-1">
                    <Link2 className="w-3 h-3 text-blue-500 shrink-0" />
                    <span>{rel}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
