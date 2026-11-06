import { getCollection } from '../config/db.js';

// @desc    Generate executive analytics, summary metrics and reports
// @route   GET /api/reports/summary
export const getSummaryReport = async (req, res) => {
  try {
    const userCollection = getCollection('users');
    const phCollection = getCollection('policyholders');
    const policyCollection = getCollection('policies');
    const claimCollection = getCollection('claims');
    const reviewCollection = getCollection('reviews');
    const settlementCollection = getCollection('settlements');

    const users = userCollection.find();
    const policyholders = phCollection.find();
    const policies = policyCollection.find();
    const claims = claimCollection.find();
    const reviews = reviewCollection.find();
    const settlements = settlementCollection.find();

    // 1. Claim status breakdown
    const statusCounts = {
      Submitted: 0,
      'Under Review': 0,
      Approved: 0,
      Rejected: 0,
      Settled: 0
    };
    claims.forEach(c => {
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      }
    });

    // 2. Policy types breakdown
    const policyTypeCounts = {
      Health: 0,
      Auto: 0,
      Home: 0,
      Life: 0
    };
    policies.forEach(p => {
      if (policyTypeCounts[p.policyType] !== undefined) {
        policyTypeCounts[p.policyType]++;
      }
    });

    // 3. Financial calculations
    const totalClaimAmount = claims.reduce((acc, c) => acc + (Number(c.claimAmount) || 0), 0);
    const totalSettledAmount = settlements
      .filter(s => s.status === 'Paid')
      .reduce((acc, s) => acc + (Number(s.settlementAmount) || 0), 0);
    const totalPendingSettlementAmount = settlements
      .filter(s => s.status === 'Pending')
      .reduce((acc, s) => acc + (Number(s.settlementAmount) || 0), 0);

    // 4. Role breakdown
    const roleCounts = {
      Admin: users.filter(u => u.role === 'Admin').length,
      'Claim Officer': users.filter(u => u.role === 'Claim Officer').length,
      Policyholder: users.filter(u => u.role === 'Policyholder').length
    };

    // 5. Payment mode distribution
    const paymentModeCounts = {
      'Bank Transfer': 0,
      UPI: 0,
      Cheque: 0
    };
    settlements.forEach(s => {
      if (paymentModeCounts[s.paymentMode] !== undefined) {
        paymentModeCounts[s.paymentMode]++;
      }
    });

    // 6. Approval rate calculation
    const decidedClaims = claims.filter(c => ['Approved', 'Rejected', 'Settled'].includes(c.status));
    const approvedOrSettled = claims.filter(c => ['Approved', 'Settled'].includes(c.status)).length;
    const approvalRate = decidedClaims.length > 0
      ? Math.round((approvedOrSettled / decidedClaims.length) * 100)
      : 100;

    res.status(200).json({
      success: true,
      data: {
        totals: {
          totalUsers: users.length,
          totalPolicyholders: policyholders.length,
          totalPolicies: policies.length,
          totalClaims: claims.length,
          totalReviews: reviews.length,
          totalSettlements: settlements.length
        },
        financials: {
          totalClaimAmount,
          totalSettledAmount,
          totalPendingSettlementAmount,
          claimToSettlementRatio: totalClaimAmount > 0 ? Math.round((totalSettledAmount / totalClaimAmount) * 100) : 0
        },
        metrics: {
          approvalRate,
          pendingOfficerAssignment: claims.filter(c => !c.assignedOfficerId && c.status === 'Submitted').length,
          activePolicies: policies.filter(p => p.status === 'Active').length
        },
        statusCounts,
        policyTypeCounts,
        roleCounts,
        paymentModeCounts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
