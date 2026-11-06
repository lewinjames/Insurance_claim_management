import mongoose from 'mongoose';

// Settlement Schema
const settlementSchema = new mongoose.Schema(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: [true, 'Claim ID is required']
    },
    settlementAmount: {
      type: Number,
      required: [true, 'Settlement amount is required'],
      min: [1, 'Settlement amount must be greater than zero']
    },
    paymentMode: {
      type: String,
      enum: ['Bank Transfer', 'Cheque', 'UPI'],
      required: [true, 'Payment disbursement mode is required']
    },
    transactionId: {
      type: String,
      required: [true, 'Bank/UPI Reference Transaction ID is required'],
      trim: true,
      unique: true
    },
    settlementDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Disbursing officer/admin ID is required']
    }
  },
  {
    timestamps: true
  }
);

settlementSchema.index({ claimId: 1 });
settlementSchema.index({ transactionId: 1 });
settlementSchema.index({ status: 1 });

const Settlement = mongoose.models.Settlement || mongoose.model('Settlement', settlementSchema);
export default Settlement;
