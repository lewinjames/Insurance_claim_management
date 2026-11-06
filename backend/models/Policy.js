import mongoose from 'mongoose';

// Policy Schema
const policySchema = new mongoose.Schema(
  {
    policyNumber: {
      type: String,
      required: [true, 'Policy number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    policyholderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policyholder',
      required: [true, 'Policyholder reference is required']
    },
    policyName: {
      type: String,
      required: [true, 'Policy name is required'],
      trim: true
    },
    policyType: {
      type: String,
      enum: ['Health', 'Auto', 'Home', 'Life'],
      required: [true, 'Policy type is required']
    },
    coverageAmount: {
      type: Number,
      required: [true, 'Coverage amount is required'],
      min: [1000, 'Minimum coverage amount is 1000']
    },
    premiumAmount: {
      type: Number,
      required: [true, 'Premium amount is required'],
      min: [100, 'Minimum premium amount is 100']
    },
    startDate: {
      type: Date,
      required: [true, 'Policy commencement start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'Policy expiration end date is required']
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Terminated'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

policySchema.index({ policyNumber: 1 });
policySchema.index({ policyholderId: 1 });
policySchema.index({ status: 1 });
policySchema.index({ policyType: 1 });

const Policy = mongoose.models.Policy || mongoose.model('Policy', policySchema);
export default Policy;
