import { Router } from 'express'
import { saveGame, listSavedGames, shareGame, getSharedGame } from '../controllers/gamesController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/save', authenticate, saveGame)
router.get('/saved', authenticate, listSavedGames)
router.post('/:id/share', authenticate, shareGame)
router.get('/shared/:token', getSharedGame)

export default router
