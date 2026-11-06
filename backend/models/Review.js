import mongoose from 'mongoose';

// Review Schema
const reviewSchema = new mongoose.Schema(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: [true, 'Claim ID is required']
    },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewing Claim Officer ID is required']
    },
    reviewNotes: {
      type: String,
      required: [true, 'Officer investigation notes and findings are required'],
      trim: true
    },
    recommendation: {
      type: String,
      enum: ['Approve', 'Reject', 'Request More Info'],
      required: [true, 'Officer recommendation verdict is required']
    },
    reviewedAmount: {
      type: Number,
      required: [true, 'Assessed eligible settlement amount is required'],
      min: [0, 'Reviewed amount cannot be negative']
    },
    reviewDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ claimId: 1 });
reviewSchema.index({ officerId: 1 });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
