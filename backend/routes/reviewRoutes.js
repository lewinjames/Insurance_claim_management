import express from 'express';
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getReviews);
router.get('/:id', getReviewById);
router.post('/', checkRole('Admin', 'Claim Officer'), createReview);
router.put('/:id', checkRole('Admin', 'Claim Officer'), updateReview);
router.delete('/:id', checkRole('Admin'), deleteReview);

export default router;
