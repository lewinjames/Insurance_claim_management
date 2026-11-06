import express from 'express';
import {
  getSettlements,
  getSettlementById,
  createSettlement,
  updateSettlement,
  deleteSettlement
} from '../controllers/settlementController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getSettlements);
router.get('/:id', getSettlementById);
router.post('/', checkRole('Admin'), createSettlement);
router.put('/:id', checkRole('Admin'), updateSettlement);
router.delete('/:id', checkRole('Admin'), deleteSettlement);

export default router;
