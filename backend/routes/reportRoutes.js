import express from 'express';
import { getSummaryReport } from '../controllers/reportController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.get('/summary', getSummaryReport);

export default router;
