const express = require('express')
const router = express.Router()

const { createExpense, getMyExpenses } = require('../controllers/expense.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.use(authMiddleware)

router.post('/', createExpense)
router.get('/', getMyExpenses)

module.exports = router