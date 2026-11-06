import express from 'express';
import {
  getPolicyholders,
  getPolicyholderById,
  createPolicyholder,
  updatePolicyholder,
  deletePolicyholder
} from '../controllers/policyholderController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getPolicyholders);
router.get('/:id', getPolicyholderById);
router.post('/', createPolicyholder);
router.put('/:id', updatePolicyholder);
router.delete('/:id', checkRole('Admin'), deletePolicyholder);

export default router;
