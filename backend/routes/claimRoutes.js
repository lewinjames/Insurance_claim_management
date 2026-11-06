import express from 'express';
import {
  getClaims,
  getClaimById,
  createClaim,
  assignOfficer,
  updateClaimStatus,
  updateClaim,
  deleteClaim
} from '../controllers/claimController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getClaims);
router.get('/:id', getClaimById);
router.post('/', createClaim); // Policyholders, Officers, Admins can file
router.put('/:id/assign', checkRole('Admin'), assignOfficer);
router.put('/:id/status', checkRole('Admin', 'Claim Officer'), updateClaimStatus);
router.put('/:id', checkRole('Admin', 'Claim Officer'), updateClaim);
router.delete('/:id', checkRole('Admin'), deleteClaim);

export default router;
