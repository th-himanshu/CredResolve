const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const settlementController = require('../controllers/settlementController');

router.post('/', auth, settlementController.createSettlement);

module.exports = router;
