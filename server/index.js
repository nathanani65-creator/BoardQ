// server/index.js
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const express = require('express')
const cors    = require('cors')

const envCandidates = ['.env', 'env']
for (const fileName of envCandidates) {
  const envPath = path.join(__dirname, fileName)
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    break
  }
}

if (!process.env.JWT_SECRET) {
  throw new Error(
    'Missing JWT_SECRET. Add it to server/.env or server/env before starting the server.'
  )
}

const app = express()
app.use(cors())
app.use(express.json())

// Import routes
const authRoutes      = require('./routes/auth')
const boardgameRoutes = require('./routes/boardgame')
const timeslotRoutes  = require('./routes/timeslot')
const bookingRoutes   = require('./routes/booking')

// Register routes
app.use('/api/auth',       authRoutes)
app.use('/api/boardgames', boardgameRoutes)
app.use('/api/timeslots',  timeslotRoutes)
app.use('/api/bookings',   bookingRoutes)

// Health check
app.get('/', (req, res) => res.json({ message: 'BoardQueue API running 🎲' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
