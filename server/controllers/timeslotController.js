// server/controllers/timeslotController.js
const db = require('../models/db')

// GET /api/timeslots?date=YYYY-MM-DD&gameId=1
const getTimeslots = (req, res) => {
  const { date, gameId } = req.query
  const slots = db.prepare('SELECT * FROM timeslots WHERE is_active = 1').all()

  const result = slots.map(slot => {
    const booked = db.prepare(`
      SELECT COALESCE(SUM(people_count), 0) as total
      FROM bookings
      WHERE timeslot_id = ? AND date = ? AND boardgame_id = ? AND status = 'confirmed'
    `).get(slot.id, date || '', gameId || 0)

    return {
      ...slot,
      booked_count:  booked.total,
      available:     slot.max_booking - booked.total,
      is_full:       booked.total >= slot.max_booking
    }
  })

  res.json({ success: true, data: result })
}

module.exports = { getTimeslots }
