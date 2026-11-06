import { getCollection } from '../config/db.js';

// @desc    Get all settlements (with status filter and pagination)
// @route   GET /api/settlements
export const getSettlements = async (req, res) => {
  try {
    const { status, paymentMode, page = 1, limit = 10 } = req.query;
    const settlementCollection = getCollection('settlements');
    const claimCollection = getCollection('claims');
    const phCollection = getCollection('policyholders');
    const userCollection = getCollection('users');

    let list = settlementCollection.find();

    // If policyholder, only show settlements of their claims
    if (req.user && req.user.role === 'Policyholder') {
      const myPh = phCollection.findOne(p => p.userId === req.user.id);
      if (myPh) {
        const myClaimIds = claimCollection.find(c => c.policyholderId === myPh._id).map(c => c._id);
        list = list.filter(s => myClaimIds.includes(s.claimId));
      } else {
        list = [];
      }
    }

    if (status) {
      list = list.filter(s => s.status === status);
    }

    if (paymentMode) {
      list = list.filter(s => s.paymentMode === paymentMode);
    }

    // Populate Claim details, Policyholder, and Processor
    const populated = list.map(settlement => {
      const claim = claimCollection.findById(settlement.claimId);
      const ph = claim ? phCollection.findById(claim.policyholderId) : null;
      const processor = userCollection.findById(settlement.processedBy);

      return {
        ...settlement,
        claimNumber: claim ? claim.claimNumber : 'N/A',
        claimOriginalAmount: claim ? claim.claimAmount : 0,
        policyholderName: ph ? ph.fullName : 'N/A',
        policyholderPhone: ph ? ph.phone : '',
        processedByName: processor ? processor.name : 'System Admin'
      };
    });

    // Sort by settlementDate descending
    populated.sort((a, b) => new Date(b.settlementDate) - new Date(a.settlementDate));

    const total = populated.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = populated.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      settlements: paginated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get settlement by ID
// @route   GET /api/settlements/:id
export const getSettlementById = async (req, res) => {
  try {
    const settlementCollection = getCollection('settlements');
    const claimCollection = getCollection('claims');
    const phCollection = getCollection('policyholders');

    const settlement = settlementCollection.findById(req.params.id);
    if (!settlement) {
      return res.status(404).json({ success: false, message: 'Settlement record not found' });
    }

    const claim = claimCollection.findById(settlement.claimId);
    const ph = claim ? phCollection.findById(claim.policyholderId) : null;

    res.status(200).json({
      success: true,
      settlement: {
        ...settlement,
        claim,
        policyholder: ph
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Process new claim payout / settlement (Admin only)
// @route   POST /api/settlements
export const createSettlement = async (req, res) => {
  try {
    const { claimId, settlementAmount, paymentMode, transactionId, status = 'Paid' } = req.body;

    if (!claimId || !settlementAmount || !paymentMode) {
      return res.status(400).json({
        success: false,
        message: 'Claim ID, Settlement Amount, and Payment Mode are required.'
      });
    }

    const claimCollection = getCollection('claims');
    const claim = claimCollection.findById(claimId);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Associated Claim does not exist.' });
    }

    const settlementCollection = getCollection('settlements');

    // Generate unique transaction reference if not given
    const txId = transactionId || `${paymentMode.replace(/\s+/g, '').toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newSettlement = settlementCollection.create({
      claimId,
      settlementAmount: Number(settlementAmount),
      paymentMode,
      transactionId: txId,
      settlementDate: new Date().toISOString().split('T')[0],
      status,
      processedBy: req.user ? req.user.id : 'usr_admin_01'
    });

    // If status is Paid, update the claim's status to 'Settled'
    if (status === 'Paid') {
      claimCollection.findByIdAndUpdate(claimId, {
        status: 'Settled',
        updatedAt: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: `Settlement of ₹${settlementAmount} recorded successfully (Ref: ${txId}). Claim marked as Settled.`,
      settlement: newSettlement
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update settlement
// @route   PUT /api/settlements/:id
export const updateSettlement = async (req, res) => {
  try {
    const settlementCollection = getCollection('settlements');
    const updated = settlementCollection.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Settlement not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Settlement updated successfully',
      settlement: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete settlement
// @route   DELETE /api/settlements/:id
export const deleteSettlement = async (req, res) => {
  try {
    const settlementCollection = getCollection('settlements');
    const deleted = settlementCollection.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Settlement not found' });
    }
    res.status(200).json({ success: true, message: 'Settlement deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
