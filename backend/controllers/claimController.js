import { getCollection } from '../config/db.js';

// @desc    Get all claims with search, filters, pagination and population
// @route   GET /api/claims
export const getClaims = async (req, res) => {
  try {
    const { status, search, assignedToMe, page = 1, limit = 10 } = req.query;
    const claimCollection = getCollection('claims');
    const policyCollection = getCollection('policies');
    const phCollection = getCollection('policyholders');
    const userCollection = getCollection('users');
    const reviewCollection = getCollection('reviews');
    const settlementCollection = getCollection('settlements');

    let list = claimCollection.find();

    // Role-based visibility
    if (req.user && req.user.role === 'Policyholder') {
      const myPh = phCollection.findOne(p => p.userId === req.user.id);
      if (myPh) {
        list = list.filter(c => c.policyholderId === myPh._id);
      } else {
        list = [];
      }
    } else if (req.user && req.user.role === 'Claim Officer' && assignedToMe === 'true') {
      list = list.filter(c => c.assignedOfficerId === req.user.id);
    }

    if (status) {
      list = list.filter(c => c.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.claimNumber && c.claimNumber.toLowerCase().includes(q)) ||
        (c.reason && c.reason.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }

    // Populate relations
    const populated = list.map(claim => {
      const policy = policyCollection.findById(claim.policyId);
      const ph = phCollection.findById(claim.policyholderId);
      const officer = claim.assignedOfficerId ? userCollection.findById(claim.assignedOfficerId) : null;
      const reviews = reviewCollection.find(r => r.claimId === claim._id);
      const settlement = settlementCollection.findOne(s => s.claimId === claim._id);

      return {
        ...claim,
        policyNumber: policy ? policy.policyNumber : 'N/A',
        policyName: policy ? policy.policyName : 'N/A',
        policyType: policy ? policy.policyType : 'N/A',
        coverageAmount: policy ? policy.coverageAmount : 0,
        policyholderName: ph ? ph.fullName : 'N/A',
        policyholderPhone: ph ? ph.phone : '',
        assignedOfficerName: officer ? officer.name : 'Unassigned',
        assignedOfficerEmail: officer ? officer.email : '',
        reviewCount: reviews.length,
        hasSettlement: !!settlement
      };
    });

    // Sort by submittedAt descending
    populated.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    const total = populated.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = populated.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      claims: paginated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get complete claim dossier by ID (with policy, ph, documents, reviews, settlement)
// @route   GET /api/claims/:id
export const getClaimById = async (req, res) => {
  try {
    const claimCollection = getCollection('claims');
    const policyCollection = getCollection('policies');
    const phCollection = getCollection('policyholders');
    const docCollection = getCollection('claimDocuments');
    const reviewCollection = getCollection('reviews');
    const settlementCollection = getCollection('settlements');
    const userCollection = getCollection('users');

    const claim = claimCollection.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const policy = policyCollection.findById(claim.policyId);
    const ph = phCollection.findById(claim.policyholderId);
    const officer = claim.assignedOfficerId ? userCollection.findById(claim.assignedOfficerId) : null;
    const documents = docCollection.find(d => d.claimId === claim._id);
    const reviews = reviewCollection.find(r => r.claimId === claim._id).map(r => {
      const revOfficer = userCollection.findById(r.officerId);
      return {
        ...r,
        officerName: revOfficer ? revOfficer.name : 'Officer'
      };
    });
    const settlement = settlementCollection.findOne(s => s.claimId === claim._id);

    // If settlement exists, populate processedBy
    let enrichedSettlement = null;
    if (settlement) {
      const processor = userCollection.findById(settlement.processedBy);
      enrichedSettlement = {
        ...settlement,
        processorName: processor ? processor.name : 'Admin'
      };
    }

    res.status(200).json({
      success: true,
      claim: {
        ...claim,
        policy,
        policyholder: ph,
        assignedOfficer: officer ? { _id: officer._id, name: officer.name, email: officer.email } : null,
        documents,
        reviews,
        settlement: enrichedSettlement
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit a new insurance claim (with optional initial document attachment)
// @route   POST /api/claims
export const createClaim = async (req, res) => {
  try {
    const {
      policyId,
      policyholderId,
      incidentDate,
      claimAmount,
      reason,
      description,
      initialDocument
    } = req.body;

    // Backend validation
    if (!policyId || !incidentDate || !claimAmount || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Policy, Incident Date, Claim Amount, Reason, and Description are required.'
      });
    }

    if (Number(claimAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Claim amount must be a positive number.'
      });
    }

    const claimCollection = getCollection('claims');
    const phCollection = getCollection('policyholders');
    const policyCollection = getCollection('policies');
    const docCollection = getCollection('claimDocuments');

    // Determine policyholderId
    let targetPhId = policyholderId;
    if (!targetPhId && req.user) {
      const myPh = phCollection.findOne(p => p.userId === req.user.id);
      if (myPh) targetPhId = myPh._id;
    }

    const policy = policyCollection.findById(policyId);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Specified policy does not exist.' });
    }

    // Verify claim amount does not drastically exceed coverage
    if (Number(claimAmount) > policy.coverageAmount * 1.5) {
      return res.status(400).json({
        success: false,
        message: `Claim amount (₹${claimAmount}) significantly exceeds policy maximum coverage (₹${policy.coverageAmount}).`
      });
    }

    const claimNumber = `CLM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newClaim = claimCollection.create({
      claimNumber,
      policyId,
      policyholderId: targetPhId || policy.policyholderId,
      incidentDate,
      claimAmount: Number(claimAmount),
      reason: reason.trim(),
      description: description.trim(),
      status: 'Submitted',
      assignedOfficerId: null,
      submittedAt: new Date().toISOString()
    });

    // If an initial document was attached, create ClaimDocument record
    if (initialDocument && initialDocument.documentName) {
      docCollection.create({
        claimId: newClaim._id,
        documentName: initialDocument.documentName,
        documentType: initialDocument.documentType || 'Medical Bill',
        fileUrl: initialDocument.fileUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
        remarks: initialDocument.remarks || 'Initial document uploaded during claim registration'
      });
    }

    res.status(201).json({
      success: true,
      message: `Claim ${claimNumber} submitted successfully! Our claim processing department will review it.`,
      claim: newClaim
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Assign Claim Officer to a claim (Admin only)
// @route   PUT /api/claims/:id/assign
export const assignOfficer = async (req, res) => {
  try {
    const { officerId } = req.body;
    if (!officerId) {
      return res.status(400).json({ success: false, message: 'Officer ID is required for assignment.' });
    }

    const claimCollection = getCollection('claims');
    const userCollection = getCollection('users');

    const officer = userCollection.findById(officerId);
    if (!officer || officer.role !== 'Claim Officer') {
      return res.status(400).json({ success: false, message: 'Selected user is not a valid Claim Officer.' });
    }

    const claim = claimCollection.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    // Update officer and change status to 'Under Review' if it was 'Submitted'
    const updatedStatus = claim.status === 'Submitted' ? 'Under Review' : claim.status;

    const updated = claimCollection.findByIdAndUpdate(req.params.id, {
      assignedOfficerId: officerId,
      status: updatedStatus
    });

    res.status(200).json({
      success: true,
      message: `Claim successfully assigned to ${officer.name}.`,
      claim: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update claim status (Admin or assigned Claim Officer)
// @route   PUT /api/claims/:id/status
export const updateClaimStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const validStatuses = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Settled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const claimCollection = getCollection('claims');
    const updated = claimCollection.findByIdAndUpdate(req.params.id, {
      status,
      ...(remarks && { statusRemarks: remarks })
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Claim status updated to ${status}.`,
      claim: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update claim fields
// @route   PUT /api/claims/:id
export const updateClaim = async (req, res) => {
  try {
    const claimCollection = getCollection('claims');
    const updated = claimCollection.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }
    res.status(200).json({
      success: true,
      message: 'Claim updated successfully.',
      claim: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete claim
// @route   DELETE /api/claims/:id
export const deleteClaim = async (req, res) => {
  try {
    const claimCollection = getCollection('claims');
    const deleted = claimCollection.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }
    res.status(200).json({ success: true, message: 'Claim deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
