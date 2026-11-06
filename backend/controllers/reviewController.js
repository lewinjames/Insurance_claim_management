import { getCollection } from '../config/db.js';

// @desc    Get all reviews (or by claimId)
// @route   GET /api/reviews
export const getReviews = async (req, res) => {
  try {
    const { claimId, recommendation } = req.query;
    const reviewCollection = getCollection('reviews');
    const claimCollection = getCollection('claims');
    const userCollection = getCollection('users');

    let list = reviewCollection.find();

    if (claimId) {
      list = list.filter(r => r.claimId === claimId);
    }

    if (recommendation) {
      list = list.filter(r => r.recommendation === recommendation);
    }

    // Populate Claim Number and Officer Name
    const populated = list.map(rev => {
      const claim = claimCollection.findById(rev.claimId);
      const officer = userCollection.findById(rev.officerId);
      return {
        ...rev,
        claimNumber: claim ? claim.claimNumber : 'N/A',
        claimAmount: claim ? claim.claimAmount : 0,
        officerName: officer ? officer.name : 'Unknown Officer'
      };
    });

    res.status(200).json({
      success: true,
      total: populated.length,
      reviews: populated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
export const getReviewById = async (req, res) => {
  try {
    const reviewCollection = getCollection('reviews');
    const rev = reviewCollection.findById(req.params.id);
    if (!rev) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.status(200).json({ success: true, review: rev });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new claim review (Claim Officer or Admin)
// @route   POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { claimId, reviewNotes, recommendation, reviewedAmount } = req.body;

    if (!claimId || !reviewNotes || !recommendation) {
      return res.status(400).json({
        success: false,
        message: 'Claim ID, Review Notes, and Recommendation are required.'
      });
    }

    const claimCollection = getCollection('claims');
    const claim = claimCollection.findById(claimId);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    const reviewCollection = getCollection('reviews');
    const newReview = reviewCollection.create({
      claimId,
      officerId: req.user ? req.user.id : claim.assignedOfficerId,
      reviewNotes: reviewNotes.trim(),
      recommendation,
      reviewedAmount: Number(reviewedAmount) || 0,
      reviewDate: new Date().toISOString()
    });

    // Auto-advance claim status based on officer recommendation
    let nextClaimStatus = claim.status;
    if (recommendation === 'Approve') {
      nextClaimStatus = 'Approved';
    } else if (recommendation === 'Reject') {
      nextClaimStatus = 'Rejected';
    } else if (recommendation === 'Request More Info') {
      nextClaimStatus = 'Under Review';
    }

    claimCollection.findByIdAndUpdate(claimId, {
      status: nextClaimStatus,
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: `Review recorded with recommendation [${recommendation}]. Claim status is now ${nextClaimStatus}.`,
      review: newReview,
      updatedClaimStatus: nextClaimStatus
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
export const updateReview = async (req, res) => {
  try {
    const reviewCollection = getCollection('reviews');
    const updated = reviewCollection.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const reviewCollection = getCollection('reviews');
    const deleted = reviewCollection.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
