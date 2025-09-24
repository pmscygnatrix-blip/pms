const express = require('express');
const router = express.Router();
const { createTransaction } = require('../controllers/transactionController');

// @route   POST /api/transactions
// @desc    Handles all transaction types (Deposit, Withdraw, Buy, Sell)
// This single endpoint is the entry point for our new unified form.
router.post('/', createTransaction);

module.exports = router;

