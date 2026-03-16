// server/routes/timeslot.js
const express = require('express')
const router  = express.Router()
const { getTimeslots } = require('../controllers/timeslotController')
const { verifyToken } = require('../middleware/authMiddleware')

router.get('/', verifyToken, getTimeslots)

module.exports = router
