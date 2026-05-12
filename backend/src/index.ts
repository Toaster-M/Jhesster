import express from 'express'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import { config } from 'dotenv'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import gamesRoutes from './routes/games'

config()

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? '*' }))
app.use(express.json())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/games', gamesRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
