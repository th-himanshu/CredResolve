const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');

router.post('/', auth, expenseController.addExpense);
router.get('/:groupId', auth, expenseController.getExpenses);

module.exports = router;
