import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Local storage file path for persistent demo data when MongoDB Atlas is not directly connected
const DATA_FILE = path.resolve(process.cwd(), 'local_insurance_db.json');

// In-memory data store cache
let memoryStore = {
  users: [],
  policyholders: [],
  policies: [],
  claims: [],
  claimDocuments: [],
  reviews: [],
  settlements: []
};

// Seed initial realistic college project data
export const seedInitialData = async () => {
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('Admin@123', salt);
  const officerHash = await bcrypt.hash('Officer@123', salt);
  const userHash = await bcrypt.hash('User@123', salt);

  const users = [
    {
      _id: 'usr_admin_01',
      name: 'Rajesh Kumar (Administrator)',
      email: 'admin@insurance.edu',
      password: adminHash,
      role: 'Admin',
      phone: '+91 98765 43210',
      createdAt: '2026-01-10T09:00:00.000Z'
    },
    {
      _id: 'usr_officer_01',
      name: 'Priya Sharma (Senior Claim Officer)',
      email: 'officer@insurance.edu',
      password: officerHash,
      role: 'Claim Officer',
      phone: '+91 98111 22334',
      createdAt: '2026-01-12T10:30:00.000Z'
    },
    {
      _id: 'usr_officer_02',
      name: 'Amit Patel (Field Inspection Officer)',
      email: 'officer2@insurance.edu',
      password: officerHash,
      role: 'Claim Officer',
      phone: '+91 98222 33445',
      createdAt: '2026-01-15T11:00:00.000Z'
    },
    {
      _id: 'usr_holder_01',
      name: 'Sunita Verma (Policyholder)',
      email: 'policyholder@insurance.edu',
      password: userHash,
      role: 'Policyholder',
      phone: '+91 97333 44556',
      createdAt: '2026-02-01T14:15:00.000Z'
    },
    {
      _id: 'usr_holder_02',
      name: 'Karthik Subramanian',
      email: 'karthik@example.com',
      password: userHash,
      role: 'Policyholder',
      phone: '+91 96444 55667',
      createdAt: '2026-02-10T16:00:00.000Z'
    }
  ];

  const policyholders = [
    {
      _id: 'ph_01',
      userId: 'usr_holder_01',
      fullName: 'Sunita Verma',
      dateOfBirth: '1988-06-14',
      gender: 'Female',
      address: 'Plot 42, Green Avenue, Indiranagar, Bengaluru, Karnataka - 560038',
      phone: '+91 97333 44556',
      emergencyContact: '+91 97333 99999 (Ramesh Verma - Spouse)',
      occupation: 'Software Project Lead',
      annualIncome: 1450000,
      createdAt: '2026-02-01T14:30:00.000Z'
    },
    {
      _id: 'ph_02',
      userId: 'usr_holder_02',
      fullName: 'Karthik Subramanian',
      dateOfBirth: '1992-11-23',
      gender: 'Male',
      address: 'Flat 304, Palm Grove Towers, Anna Nagar, Chennai, Tamil Nadu - 600040',
      phone: '+91 96444 55667',
      emergencyContact: '+91 96444 88888 (Deepa S - Sister)',
      occupation: 'Chartered Accountant',
      annualIncome: 1200000,
      createdAt: '2026-02-10T16:15:00.000Z'
    }
  ];

  const policies = [
    {
      _id: 'pol_01',
      policyNumber: 'POL-HLTH-2026-081',
      policyholderId: 'ph_01',
      policyName: 'Star Comprehensive Family Health Shield',
      policyType: 'Health',
      coverageAmount: 1000000,
      premiumAmount: 18500,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'Active',
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      _id: 'pol_02',
      policyNumber: 'POL-AUTO-2026-104',
      policyholderId: 'ph_01',
      policyName: 'Bumper-to-Bumper Four Wheeler Comprehensive',
      policyType: 'Auto',
      coverageAmount: 750000,
      premiumAmount: 14200,
      startDate: '2026-02-15',
      endDate: '2027-02-14',
      status: 'Active',
      createdAt: '2026-02-15T10:00:00.000Z'
    },
    {
      _id: 'pol_03',
      policyNumber: 'POL-HOME-2025-055',
      policyholderId: 'ph_02',
      policyName: 'Home Secure Fire & Burglary Protection',
      policyType: 'Home',
      coverageAmount: 4000000,
      premiumAmount: 22000,
      startDate: '2025-08-01',
      endDate: '2026-07-31',
      status: 'Active',
      createdAt: '2025-08-01T09:00:00.000Z'
    },
    {
      _id: 'pol_04',
      policyNumber: 'POL-LIFE-2024-012',
      policyholderId: 'ph_02',
      policyName: 'Jeevan Raksha Term Life Cover',
      policyType: 'Life',
      coverageAmount: 5000000,
      premiumAmount: 31000,
      startDate: '2024-05-10',
      endDate: '2034-05-09',
      status: 'Active',
      createdAt: '2024-05-10T11:00:00.000Z'
    }
  ];

  const claims = [
    {
      _id: 'clm_01',
      claimNumber: 'CLM-2026-001',
      policyId: 'pol_01',
      policyholderId: 'ph_01',
      incidentDate: '2026-02-20',
      claimAmount: 85000,
      reason: 'Emergency Hospitalization for Acute Appendectomy surgery at Apollo Hospital',
      description: 'Patient was admitted on Feb 20, 2026 with severe abdominal pain. Laparoscopic appendectomy was performed under general anesthesia. Discharged after 3 days. All medical summaries and itemized pharmacy bills attached.',
      status: 'Settled',
      assignedOfficerId: 'usr_officer_01',
      submittedAt: '2026-02-25T11:20:00.000Z',
      updatedAt: '2026-03-02T15:45:00.000Z'
    },
    {
      _id: 'clm_02',
      claimNumber: 'CLM-2026-002',
      policyId: 'pol_02',
      policyholderId: 'ph_01',
      incidentDate: '2026-03-05',
      claimAmount: 42000,
      reason: 'Front bumper and radiator grill collision impact during city commute',
      description: 'Vehicle KA-04-MB-1988 encountered sudden rear-ending from stray vehicle at traffic intersection. Front bumper cracked, left headlamp assembly shattered, and radiator bracket damaged. Estimate provided by authorized showroom.',
      status: 'Under Review',
      assignedOfficerId: 'usr_officer_01',
      submittedAt: '2026-03-07T09:15:00.000Z',
      updatedAt: '2026-03-08T14:10:00.000Z'
    },
    {
      _id: 'clm_03',
      claimNumber: 'CLM-2026-003',
      policyId: 'pol_03',
      policyholderId: 'ph_02',
      incidentDate: '2026-03-12',
      claimAmount: 125000,
      reason: 'Severe rainwater seepage causing ceiling plaster collapse and electrical wiring damage',
      description: 'Unprecedented rainfall caused water stagnation on upper terrace, leading to interior leakage in master bedroom and short circuit in false ceiling lighting. Inspection photos and contractor repair invoice attached.',
      status: 'Approved',
      assignedOfficerId: 'usr_officer_02',
      submittedAt: '2026-03-14T16:30:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z'
    },
    {
      _id: 'clm_04',
      claimNumber: 'CLM-2026-004',
      policyId: 'pol_01',
      policyholderId: 'ph_01',
      incidentDate: '2026-03-22',
      claimAmount: 18000,
      reason: 'Dental cosmetic implant procedure expenses',
      description: 'Consultation and tooth alignment fixture expenses claimed under health shield.',
      status: 'Rejected',
      assignedOfficerId: 'usr_officer_01',
      submittedAt: '2026-03-24T12:00:00.000Z',
      updatedAt: '2026-03-26T17:00:00.000Z'
    },
    {
      _id: 'clm_05',
      claimNumber: 'CLM-2026-005',
      policyId: 'pol_03',
      policyholderId: 'ph_02',
      incidentDate: '2026-04-01',
      claimAmount: 60000,
      reason: 'Water pipe burst and damage to modular kitchen cabinets',
      description: 'Concealed pipeline ruptured overnight, damaging lower particle board cabinets. Claim filed awaiting officer assignment.',
      status: 'Submitted',
      assignedOfficerId: null,
      submittedAt: '2026-04-02T10:45:00.000Z',
      updatedAt: '2026-04-02T10:45:00.000Z'
    }
  ];

  const claimDocuments = [
    {
      _id: 'doc_01',
      claimId: 'clm_01',
      documentName: 'Apollo_Discharge_Summary_Signed.pdf',
      documentType: 'Medical Bill',
      fileUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      remarks: 'Certified clinical summary signed by attending surgeon Dr. Ananya Rao',
      uploadedAt: '2026-02-25T11:22:00.000Z'
    },
    {
      _id: 'doc_02',
      claimId: 'clm_01',
      documentName: 'Final_Itemized_Hospital_Invoice.pdf',
      documentType: 'Invoice',
      fileUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
      remarks: 'Detailed pharmacy, room rent, and operation theatre receipts totaling ₹85,000',
      uploadedAt: '2026-02-25T11:23:00.000Z'
    },
    {
      _id: 'doc_03',
      claimId: 'clm_02',
      documentName: 'Bumper_Impact_Damage_Photo_1.jpg',
      documentType: 'Damage Photo',
      fileUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
      remarks: 'Clear photograph showing front radiator and cracked bumper on vehicle KA-04-MB-1988',
      uploadedAt: '2026-03-07T09:18:00.000Z'
    },
    {
      _id: 'doc_04',
      claimId: 'clm_02',
      documentName: 'Traffic_Station_General_Diary_Entry.pdf',
      documentType: 'Police Report',
      fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      remarks: 'Traffic police self-declaration acknowledging minor collision without human injury',
      uploadedAt: '2026-03-07T09:20:00.000Z'
    },
    {
      _id: 'doc_05',
      claimId: 'clm_03',
      documentName: 'Contractor_Repair_Estimate_Ceiling.pdf',
      documentType: 'Invoice',
      fileUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      remarks: 'Structural civil restoration quotation from BuildWell Contractors',
      uploadedAt: '2026-03-14T16:35:00.000Z'
    }
  ];

  const reviews = [
    {
      _id: 'rev_01',
      claimId: 'clm_01',
      officerId: 'usr_officer_01',
      reviewNotes: 'All medical records verified with Apollo Hospital TPA desk. Condition is fully covered under section 4B of Policy POL-HLTH-2026-081. Room rent cap deducted by ₹5,000 as per standard policy schedule. Approved for ₹80,000.',
      recommendation: 'Approve',
      reviewedAmount: 80000,
      reviewDate: '2026-02-28T14:30:00.000Z'
    },
    {
      _id: 'rev_02',
      claimId: 'clm_02',
      officerId: 'usr_officer_01',
      reviewNotes: 'Surveyor inspected the vehicle at garage. Bumper replacement authorized; paint blending estimate is slightly high. Negotiating revised labor cost with showroom manager.',
      recommendation: 'Request More Info',
      reviewedAmount: 38000,
      reviewDate: '2026-03-08T14:10:00.000Z'
    },
    {
      _id: 'rev_03',
      claimId: 'clm_03',
      officerId: 'usr_officer_02',
      reviewNotes: 'On-site physical inspection performed. Damage directly attributable to severe tempest water ingress. Quotation reviewed against standard CPWD rates. Approved in full.',
      recommendation: 'Approve',
      reviewedAmount: 125000,
      reviewDate: '2026-03-18T10:00:00.000Z'
    },
    {
      _id: 'rev_04',
      claimId: 'clm_04',
      officerId: 'usr_officer_01',
      reviewNotes: 'Cosmetic dental procedures are explicitly excluded under General Exclusion Clause 12.1 unless arising from accidental facial trauma. Hence recommended for rejection.',
      recommendation: 'Reject',
      reviewedAmount: 0,
      reviewDate: '2026-03-26T17:00:00.000Z'
    }
  ];

  const settlements = [
    {
      _id: 'set_01',
      claimId: 'clm_01',
      settlementAmount: 80000,
      paymentMode: 'Bank Transfer',
      transactionId: 'NEFT-ICICI-20260302-887412',
      settlementDate: '2026-03-02',
      status: 'Paid',
      processedBy: 'usr_admin_01'
    },
    {
      _id: 'set_02',
      claimId: 'clm_03',
      settlementAmount: 125000,
      paymentMode: 'UPI',
      transactionId: 'UPI-HDFC-20260319-994101',
      settlementDate: '2026-03-19',
      status: 'Pending',
      processedBy: 'usr_admin_01'
    }
  ];

  return { users, policyholders, policies, claims, claimDocuments, reviews, settlements };
};

// Initialize DB and in-memory cache
export const initDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.startsWith('mongodb')) {
    try {
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB Atlas successfully.');
    } catch (err) {
      console.warn('⚠️ MongoDB Atlas connection error. Falling back to local data store:', err.message);
    }
  } else {
    console.log('ℹ️ MONGODB_URI not provided. Running in high-reliability embedded JSON storage mode (Mongoose Schemas & Models active).');
  }

  // Load existing data from file or initialize with seed data
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
      console.log('📂 Loaded existing insurance records from local storage.');
    } else {
      memoryStore = await seedInitialData();
      saveStoreToFile();
      console.log('🌱 Seeded initial college project records (Users, Policies, Claims, Documents, Reviews, Settlements).');
    }
  } catch (e) {
    memoryStore = await seedInitialData();
    console.log('⚠️ Re-seeded data store due to error:', e.message);
  }
};

export const saveStoreToFile = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save to local file:', err.message);
  }
};

// Generic DB access interface for controller files
export const getCollection = (collectionName) => {
  if (!memoryStore[collectionName]) {
    memoryStore[collectionName] = [];
  }
  return {
    find: (filterFn = () => true) => {
      return [...memoryStore[collectionName].filter(filterFn)];
    },
    findById: (id) => {
      return memoryStore[collectionName].find(item => item._id === id || item.id === id);
    },
    findOne: (filterFn) => {
      return memoryStore[collectionName].find(filterFn);
    },
    create: (newItem) => {
      const itemWithId = {
        _id: newItem._id || `${collectionName.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        createdAt: newItem.createdAt || new Date().toISOString(),
        ...newItem
      };
      memoryStore[collectionName].push(itemWithId);
      saveStoreToFile();
      return itemWithId;
    },
    findByIdAndUpdate: (id, updateFields) => {
      const idx = memoryStore[collectionName].findIndex(item => item._id === id || item.id === id);
      if (idx === -1) return null;
      memoryStore[collectionName][idx] = {
        ...memoryStore[collectionName][idx],
        ...updateFields,
        updatedAt: new Date().toISOString()
      };
      saveStoreToFile();
      return memoryStore[collectionName][idx];
    },
    findByIdAndDelete: (id) => {
      const idx = memoryStore[collectionName].findIndex(item => item._id === id || item.id === id);
      if (idx === -1) return null;
      const deleted = memoryStore[collectionName].splice(idx, 1)[0];
      saveStoreToFile();
      return deleted;
    },
    countDocuments: (filterFn = () => true) => {
      return memoryStore[collectionName].filter(filterFn).length;
    },
    resetData: async () => {
      memoryStore = await seedInitialData();
      saveStoreToFile();
      return memoryStore;
    }
  };
};

export const dbStore = memoryStore;
