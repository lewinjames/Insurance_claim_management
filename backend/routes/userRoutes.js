import express from 'express';
import {
  getUsers,
  getOfficers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Officers list is accessible to Admin & Claim Officer (for assignment dropdown)
router.get('/officers', verifyToken, getOfficers);

// General User management (Admin only)
router.get('/', verifyToken, checkRole('Admin'), getUsers);
router.get('/:id', verifyToken, checkRole('Admin'), getUserById);
router.post('/', verifyToken, checkRole('Admin'), createUser);
router.put('/:id', verifyToken, checkRole('Admin'), updateUser);
router.delete('/:id', verifyToken, checkRole('Admin'), deleteUser);

export default router;
