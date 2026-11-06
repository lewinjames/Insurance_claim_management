import mongoose from 'mongoose';

// ClaimDocument Schema
const claimDocumentSchema = new mongoose.Schema(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: [true, 'Associated Claim ID is required']
    },
    documentName: {
      type: String,
      required: [true, 'Document filename/label is required'],
      trim: true
    },
    documentType: {
      type: String,
      enum: ['Medical Bill', 'Police Report', 'Damage Photo', 'Invoice', 'ID Proof'],
      required: [true, 'Document category is required']
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL or storage path is required']
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

claimDocumentSchema.index({ claimId: 1 });
claimDocumentSchema.index({ documentType: 1 });

const ClaimDocument = mongoose.models.ClaimDocument || mongoose.model('ClaimDocument', claimDocumentSchema);
export default ClaimDocument;
