import { Router } from 'express';
import * as userController from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/:id', userController.getProfile);
router.put('/:id', requireAuth, userController.updateProfile);
router.get('/:id/stats', userController.getStats);

export default router;
