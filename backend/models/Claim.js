import mongoose from 'mongoose';

// Claim Schema
const claimSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      required: [true, 'Claim number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
      required: [true, 'Policy reference is required']
    },
    policyholderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policyholder',
      required: [true, 'Policyholder reference is required']
    },
    incidentDate: {
      type: Date,
      required: [true, 'Date of incident/occurrence is required']
    },
    claimAmount: {
      type: Number,
      required: [true, 'Claim settlement requested amount is required'],
      min: [1, 'Claim amount must be greater than 0']
    },
    reason: {
      type: String,
      required: [true, 'Claim cause/reason summary is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Detailed incident description is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Settled'],
      default: 'Submitted'
    },
    assignedOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

claimSchema.index({ claimNumber: 1 });
claimSchema.index({ policyId: 1 });
claimSchema.index({ policyholderId: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ assignedOfficerId: 1 });

const Claim = mongoose.models.Claim || mongoose.model('Claim', claimSchema);
export default Claim;
