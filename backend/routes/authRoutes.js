import express from 'express';
import { register, login, getMe, resetDemoDb } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.post('/reset-demo-db', resetDemoDb);

export default router;
