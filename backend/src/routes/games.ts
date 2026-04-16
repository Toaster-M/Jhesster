import { Router } from 'express';
import * as gameController from '../controllers/gameController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, gameController.createGame);
router.get('/', requireAuth, gameController.listGames);
router.get('/:id', gameController.getGame);
router.post('/:id/moves', requireAuth, gameController.addMove);
router.put('/:id/end', requireAuth, gameController.endGame);

export default router;
