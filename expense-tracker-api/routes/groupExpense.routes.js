const express = require('express')
const router = express.Router()

const {
    addGroupExpense,
    getGroupExpenses
} = require('../controllers/groupExpense.controller')

const authMiddleware = require('../middleware/auth.middleware')

router.use(authMiddleware)

router.post('/', addGroupExpense)
router.get('/group/:groupId', getGroupExpenses)

module.exports = router