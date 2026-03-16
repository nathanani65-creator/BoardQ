const express = require('express');
const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Add more routes here as needed
// router.use('/users', require('./users'));
// router.use('/boards', require('./boards'));

module.exports = router;
