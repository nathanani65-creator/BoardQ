// server/routes/boardgame.js
const express = require('express')
const router  = express.Router()
const { getAllGames, getGameById, createGame, updateGame, deleteGame } = require('../controllers/boardgameController')
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware')

router.get('/',     verifyToken, getAllGames)
router.get('/:id',  verifyToken, getGameById)
router.post('/',    verifyAdmin, createGame)
router.put('/:id',  verifyAdmin, updateGame)
router.delete('/:id', verifyAdmin, deleteGame)

module.exports = router
