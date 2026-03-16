// server/routes/auth.js
const express = require('express')
const router  = express.Router()
const { register, login, getMe, getUsers } = require('../controllers/authController')
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware')

router.post('/register', register)
router.post('/login',    login)
router.get('/me',        verifyToken, getMe)
router.get('/users',     verifyAdmin, getUsers)

module.exports = router
