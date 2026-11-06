import { getCollection } from '../config/db.js';

// @desc    Get all documents (or by claimId)
// @route   GET /api/documents
export const getDocuments = async (req, res) => {
  try {
    const { claimId, documentType } = req.query;
    const docCollection = getCollection('claimDocuments');
    const claimCollection = getCollection('claims');

    let list = docCollection.find();

    if (claimId) {
      list = list.filter(d => d.claimId === claimId);
    }

    if (documentType) {
      list = list.filter(d => d.documentType === documentType);
    }

    // Populate Claim Number
    const populated = list.map(doc => {
      const claim = claimCollection.findById(doc.claimId);
      return {
        ...doc,
        claimNumber: claim ? claim.claimNumber : 'N/A'
      };
    });

    res.status(200).json({
      success: true,
      total: populated.length,
      documents: populated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single document by ID
// @route   GET /api/documents/:id
export const getDocumentById = async (req, res) => {
  try {
    const docCollection = getCollection('claimDocuments');
    const doc = docCollection.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.status(200).json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Upload / Add new claim document
// @route   POST /api/documents
export const createDocument = async (req, res) => {
  try {
    const { claimId, documentName, documentType, fileUrl, remarks } = req.body;

    if (!claimId || !documentName || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'Claim ID, Document Name, and Document Type are required.'
      });
    }

    const claimCollection = getCollection('claims');
    const claim = claimCollection.findById(claimId);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Referenced Claim does not exist.' });
    }

    const docCollection = getCollection('claimDocuments');
    const newDoc = docCollection.create({
      claimId,
      documentName: documentName.trim(),
      documentType,
      fileUrl: fileUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
      remarks: remarks ? remarks.trim() : '',
      uploadedAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Claim document recorded successfully',
      document: newDoc
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update document metadata
// @route   PUT /api/documents/:id
export const updateDocument = async (req, res) => {
  try {
    const docCollection = getCollection('claimDocuments');
    const updated = docCollection.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      document: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
export const deleteDocument = async (req, res) => {
  try {
    const docCollection = getCollection('claimDocuments');
    const deleted = docCollection.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
