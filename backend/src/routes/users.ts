import { Router } from 'express'
import { updateSettings } from '../controllers/usersController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.patch('/me/settings', authenticate, updateSettings)

export default router
