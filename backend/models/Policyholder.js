import mongoose from 'mongoose';

// Policyholder Schema
const policyholderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Policyholder must be linked to a registered User']
    },
    fullName: {
      type: String,
      required: [true, 'Policyholder full name is required'],
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required']
    },
    address: {
      type: String,
      required: [true, 'Residential address is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true
    },
    emergencyContact: {
      type: String,
      required: [true, 'Emergency contact person and phone is required'],
      trim: true
    },
    occupation: {
      type: String,
      default: 'Self-Employed'
    },
    annualIncome: {
      type: Number,
      required: [true, 'Annual income is required for policy eligibility'],
      min: [0, 'Annual income cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

policyholderSchema.index({ userId: 1 });
policyholderSchema.index({ fullName: 1 });
policyholderSchema.index({ phone: 1 });

const Policyholder = mongoose.models.Policyholder || mongoose.model('Policyholder', policyholderSchema);
export default Policyholder;
