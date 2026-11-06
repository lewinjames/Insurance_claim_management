import { getCollection } from '../config/db.js';

// @desc    Get all policies with search, filter by policyType, status & pagination
// @route   GET /api/policies
export const getPolicies = async (req, res) => {
  try {
    const { search, policyType, status, policyholderId, page = 1, limit = 10 } = req.query;
    const policyCollection = getCollection('policies');
    const phCollection = getCollection('policyholders');

    let list = policyCollection.find();

    // If current user is Policyholder, only show their own policies
    if (req.user && req.user.role === 'Policyholder') {
      const myPh = phCollection.findOne(p => p.userId === req.user.id);
      if (myPh) {
        list = list.filter(p => p.policyholderId === myPh._id);
      } else {
        list = [];
      }
    } else if (policyholderId) {
      list = list.filter(p => p.policyholderId === policyholderId);
    }

    if (policyType) {
      list = list.filter(p => p.policyType === policyType);
    }

    if (status) {
      list = list.filter(p => p.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.policyNumber && p.policyNumber.toLowerCase().includes(q)) ||
        (p.policyName && p.policyName.toLowerCase().includes(q))
      );
    }

    // Populate Policyholder Name
    const populated = list.map(policy => {
      const ph = phCollection.findById(policy.policyholderId);
      return {
        ...policy,
        policyholderName: ph ? ph.fullName : 'Unknown Holder',
        policyholderPhone: ph ? ph.phone : ''
      };
    });

    // Sorting by start date descending
    populated.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    const total = populated.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = populated.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      policies: paginated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single policy by ID
// @route   GET /api/policies/:id
export const getPolicyById = async (req, res) => {
  try {
    const policyCollection = getCollection('policies');
    const phCollection = getCollection('policyholders');
    const claimCollection = getCollection('claims');

    const policy = policyCollection.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const ph = phCollection.findById(policy.policyholderId);
    const relatedClaims = claimCollection.find(c => c.policyId === policy._id);

    res.status(200).json({
      success: true,
      policy: {
        ...policy,
        policyholderName: ph ? ph.fullName : 'Unknown',
        policyholderPhone: ph ? ph.phone : '',
        policyholderAddress: ph ? ph.address : '',
        claims: relatedClaims
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new policy
// @route   POST /api/policies
export const createPolicy = async (req, res) => {
  try {
    const {
      policyNumber,
      policyholderId,
      policyName,
      policyType,
      coverageAmount,
      premiumAmount,
      startDate,
      endDate,
      status = 'Active'
    } = req.body;

    // Backend validation
    if (!policyholderId || !policyName || !policyType || !coverageAmount || !premiumAmount || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Policyholder, Name, Type, Coverage, Premium, Start/End Dates) are required.'
      });
    }

    if (Number(coverageAmount) <= 0 || Number(premiumAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Coverage and Premium amounts must be positive numbers.'
      });
    }

    const policyCollection = getCollection('policies');
    const generatedPolNum = policyNumber || `POL-${policyType.toUpperCase().slice(0, 4)}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPolicy = policyCollection.create({
      policyNumber: generatedPolNum,
      policyholderId,
      policyName: policyName.trim(),
      policyType,
      coverageAmount: Number(coverageAmount),
      premiumAmount: Number(premiumAmount),
      startDate,
      endDate,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      policy: newPolicy
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update policy
// @route   PUT /api/policies/:id
export const updatePolicy = async (req, res) => {
  try {
    const policyCollection = getCollection('policies');
    const updated = policyCollection.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Policy updated successfully',
      policy: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete policy
// @route   DELETE /api/policies/:id
export const deletePolicy = async (req, res) => {
  try {
    const policyCollection = getCollection('policies');
    const deleted = policyCollection.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.status(200).json({ success: true, message: 'Policy deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
