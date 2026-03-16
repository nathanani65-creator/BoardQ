// server/controllers/authController.js
const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const db     = require('../models/db')

// POST /api/auth/register
const register = (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' })

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ message: 'อีเมลนี้ถูกใช้แล้ว' })

  const hashed = bcrypt.hashSync(password, 10)
  const result = db.prepare(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
  ).run(name, email, hashed)

  res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', userId: result.lastInsertRowid })
}

// POST /api/auth/login
const login = (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' })

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })

  const valid = bcrypt.compareSync(password, user.password)
  if (!valid) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({
    message: 'เข้าสู่ระบบสำเร็จ',
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  })
}

// GET /api/auth/me
const getMe = (req, res) => {
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' })
  res.json({ user })
}

// GET /api/auth/users  (admin only)
const getUsers = (req, res) => {
  const users = db.prepare(
    'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC'
  ).all()
  res.json({ success: true, data: users })
}

module.exports = { register, login, getMe, getUsers }
