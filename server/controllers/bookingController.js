// server/controllers/bookingController.js
const db = require('../models/db')

// GET /api/bookings/my  — ประวัติของ user ที่ login
const getMyBookings = (req, res) => {
  const rows = db.prepare(`
    SELECT b.*, g.name as game_name, g.image as game_image,
           t.start_time, t.end_time
    FROM bookings b
    JOIN boardgames g ON g.id = b.boardgame_id
    JOIN timeslots  t ON t.id = b.timeslot_id
    WHERE b.user_id = ?
    ORDER BY b.date DESC, t.start_time
  `).all(req.user.id)
  res.json({ success: true, data: rows })
}

// POST /api/bookings  — สร้างการจองใหม่
const createBooking = (req, res) => {
  const { boardgame_id, timeslot_id, date, people_count } = req.body
  if (!boardgame_id || !timeslot_id || !date || !people_count)
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' })

  // ตรวจสอบว่าจองซ้ำไหม
  const dup = db.prepare(`
    SELECT id FROM bookings
    WHERE user_id=? AND boardgame_id=? AND timeslot_id=? AND date=? AND status='confirmed'
  `).get(req.user.id, boardgame_id, timeslot_id, date)
  if (dup) return res.status(409).json({ message: 'คุณจองช่วงเวลานี้ไปแล้ว' })

  // ตรวจสอบที่ว่าง
  const slot = db.prepare('SELECT * FROM timeslots WHERE id = ?').get(timeslot_id)
  const booked = db.prepare(`
    SELECT COALESCE(SUM(people_count), 0) as total FROM bookings
    WHERE timeslot_id=? AND date=? AND boardgame_id=? AND status='confirmed'
  `).get(timeslot_id, date, boardgame_id)

  if (booked.total + people_count > slot.max_booking)
    return res.status(400).json({ message: 'ที่นั่งไม่เพียงพอ' })

  const result = db.prepare(`
    INSERT INTO bookings (user_id, boardgame_id, timeslot_id, date, people_count)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, boardgame_id, timeslot_id, date, people_count)

  res.status(201).json({ success: true, bookingId: result.lastInsertRowid, message: 'จองสำเร็จ!' })
}

// DELETE /api/bookings/:id  — ยกเลิกการจอง
const cancelBooking = (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id=? AND user_id=?')
    .get(req.params.id, req.user.id)
  if (!booking) return res.status(404).json({ message: 'ไม่พบการจอง' })

  db.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").run(req.params.id)
  res.json({ success: true, message: 'ยกเลิกการจองสำเร็จ' })
}

// GET /api/bookings/all  — admin ดูทั้งหมด
const getAllBookings = (req, res) => {
  const { date, search } = req.query
  let query = `
    SELECT b.*, u.name as user_name, u.email as user_email,
           g.name as game_name, t.start_time, t.end_time
    FROM bookings b
    JOIN users      u ON u.id = b.user_id
    JOIN boardgames g ON g.id = b.boardgame_id
    JOIN timeslots  t ON t.id = b.timeslot_id
    WHERE 1=1
  `
  const params = []
  if (date)   { query += ' AND b.date = ?';              params.push(date) }
  if (search) { query += ' AND (u.name LIKE ? OR u.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
  query += ' ORDER BY b.date DESC, t.start_time'

  const rows = db.prepare(query).all(...params)
  res.json({ success: true, data: rows })
}

module.exports = { getMyBookings, createBooking, cancelBooking, getAllBookings }
