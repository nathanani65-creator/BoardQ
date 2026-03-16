// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

  if (!token) return res.status(401).json({ message: 'ไม่มี token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, name, email, role }
    next()
  } catch {
    res.status(403).json({ message: 'token ไม่ถูกต้องหรือหมดอายุ' })
  }
}

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'สิทธิ์ admin เท่านั้น' })
    }
    next()
  })
}

module.exports = { verifyToken, verifyAdmin }
