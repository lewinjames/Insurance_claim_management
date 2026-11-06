import { getCollection } from '../config/db.js';

// @desc    Get all policyholders (with search and pagination)
// @route   GET /api/policyholders
export const getPolicyholders = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const phCollection = getCollection('policyholders');
    const userCollection = getCollection('users');
    const policyCollection = getCollection('policies');

    let list = phCollection.find();

    // If current user is a Policyholder, only show their own record
    if (req.user && req.user.role === 'Policyholder') {
      list = list.filter(p => p.userId === req.user.id);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.fullName && p.fullName.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        (p.occupation && p.occupation.toLowerCase().includes(q))
      );
    }

    // Populate user and active policy count
    const populated = list.map(ph => {
      const u = userCollection.findById(ph.userId);
      const userPolicies = policyCollection.find(p => p.policyholderId === ph._id);
      return {
        ...ph,
        userEmail: u ? u.email : '',
        totalPolicies: userPolicies.length
      };
    });

    const total = populated.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = populated.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      policyholders: paginated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single policyholder by ID with related policies and claims
// @route   GET /api/policyholders/:id
export const getPolicyholderById = async (req, res) => {
  try {
    const phCollection = getCollection('policyholders');
    const policyCollection = getCollection('policies');
    const claimCollection = getCollection('claims');
    const userCollection = getCollection('users');

    const ph = phCollection.findById(req.params.id);
    if (!ph) {
      return res.status(404).json({ success: false, message: 'Policyholder record not found' });
    }

    const user = userCollection.findById(ph.userId);
    const policies = policyCollection.find(p => p.policyholderId === ph._id);
    const claims = claimCollection.find(c => c.policyholderId === ph._id);

    res.status(200).json({
      success: true,
      policyholder: {
        ...ph,
        userEmail: user ? user.email : '',
        policies,
        claims
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new policyholder record
// @route   POST /api/policyholders
export const createPolicyholder = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      dateOfBirth,
      gender,
      address,
      phone,
      emergencyContact,
      occupation,
      annualIncome
    } = req.body;

    // Backend validation
    if (!fullName || !phone || !address || !emergencyContact) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Phone, Address, and Emergency Contact are required.'
      });
    }

    const phCollection = getCollection('policyholders');
    const newPh = phCollection.create({
      userId: userId || req.user.id,
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth || '1990-01-01',
      gender: gender || 'Male',
      address: address.trim(),
      phone: phone.trim(),
      emergencyContact: emergencyContact.trim(),
      occupation: occupation || 'General',
      annualIncome: Number(annualIncome) || 500000
    });

    res.status(201).json({
      success: true,
      message: 'Policyholder record created successfully',
      policyholder: newPh
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update policyholder record
// @route   PUT /api/policyholders/:id
export const updatePolicyholder = async (req, res) => {
  try {
    const phCollection = getCollection('policyholders');
    const updated = phCollection.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Policyholder not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Policyholder updated successfully',
      policyholder: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete policyholder record
// @route   DELETE /api/policyholders/:id
export const deletePolicyholder = async (req, res) => {
  try {
    const phCollection = getCollection('policyholders');
    const deleted = phCollection.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Policyholder not found' });
    }
    res.status(200).json({ success: true, message: 'Policyholder deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
