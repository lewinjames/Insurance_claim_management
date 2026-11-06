import express from 'express';
import {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy
} from '../controllers/policyController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getPolicies);
router.get('/:id', getPolicyById);
router.post('/', checkRole('Admin', 'Claim Officer'), createPolicy);
router.put('/:id', checkRole('Admin', 'Claim Officer'), updatePolicy);
router.delete('/:id', checkRole('Admin'), deletePolicy);

export default router;
