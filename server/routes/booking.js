// server/routes/booking.js
const express = require('express')
const router  = express.Router()
const { getMyBookings, createBooking, cancelBooking, getAllBookings } = require('../controllers/bookingController')
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware')

router.get('/my',    verifyToken, getMyBookings)
router.get('/all',   verifyAdmin, getAllBookings)
router.post('/',     verifyToken, createBooking)
router.delete('/:id', verifyToken, cancelBooking)

module.exports = router
