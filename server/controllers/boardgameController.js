// server/controllers/boardgameController.js
const db = require('../models/db')

// GET /api/boardgames
const getAllGames = (req, res) => {
  const { category } = req.query
  let query = `
    SELECT g.*,
      COALESCE((
        SELECT SUM(b.people_count) FROM bookings b
        WHERE b.boardgame_id = g.id
          AND b.date = DATE('now','localtime')
          AND b.status = 'confirmed'
      ), 0) AS current_players
    FROM boardgames g
  `
  const params = []
  if (category && category !== 'all') {
    query += ' WHERE g.category = ?'
    params.push(category)
  }
  query += ' ORDER BY g.name'

  const rows = db.prepare(query).all(...params)
  const games = rows.map(g => ({ ...g, rules: g.rules ? JSON.parse(g.rules) : [] }))
  res.json({ success: true, data: games })
}

// GET /api/boardgames/:id
const getGameById = (req, res) => {
  const game = db.prepare(`
    SELECT g.*,
      COALESCE((
        SELECT SUM(b.people_count) FROM bookings b
        WHERE b.boardgame_id = g.id
          AND b.date = DATE('now','localtime')
          AND b.status = 'confirmed'
      ), 0) AS current_players
    FROM boardgames g WHERE g.id = ?
  `).get(req.params.id)

  if (!game) return res.status(404).json({ message: 'ไม่พบเกม' })
  res.json({ success: true, data: { ...game, rules: game.rules ? JSON.parse(game.rules) : [] } })
}

// POST /api/boardgames  (admin only)
const createGame = (req, res) => {
  const { name, description, category, max_players, min_players, play_time, min_age, image, rules } = req.body
  if (!name || !category || !max_players)
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' })

  const result = db.prepare(`
    INSERT INTO boardgames (name, description, category, max_players, min_players, play_time, min_age, image, rules)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, description, category, max_players, min_players || 2, play_time || 60, min_age || 8, image,
         rules ? JSON.stringify(rules) : null)

  res.status(201).json({ success: true, id: result.lastInsertRowid })
}

// PUT /api/boardgames/:id  (admin only)
const updateGame = (req, res) => {
  const { name, description, category, max_players, min_players, play_time, min_age, image, rules } = req.body
  db.prepare(`
    UPDATE boardgames SET name=?, description=?, category=?, max_players=?,
      min_players=?, play_time=?, min_age=?, image=?, rules=?
    WHERE id=?
  `).run(name, description, category, max_players, min_players, play_time, min_age, image,
         rules ? JSON.stringify(rules) : null, req.params.id)

  res.json({ success: true, message: 'อัปเดตเกมสำเร็จ' })
}

// DELETE /api/boardgames/:id  (admin only)
const deleteGame = (req, res) => {
  db.prepare('DELETE FROM boardgames WHERE id = ?').run(req.params.id)
  res.json({ success: true, message: 'ลบเกมสำเร็จ' })
}

module.exports = { getAllGames, getGameById, createGame, updateGame, deleteGame }
