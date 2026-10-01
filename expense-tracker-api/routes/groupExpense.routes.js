const express = require('express')
const router = express.Router()

const {
    addGroupExpense,
    getGroupExpenses,
    getGroupBalances,
    settlePayment,
    getGroupSettlements
} = require('../controllers/groupExpense.controller')

const authMiddleware = require('../middleware/auth.middleware')

router.use(authMiddleware)

router.post('/', addGroupExpense)
router.get('/group/:groupId', getGroupExpenses)
router.get('/group/:groupId/balances', getGroupBalances)
router.post('/group/:groupId/settle', settlePayment)
router.get('/group/:groupId/settlements', getGroupSettlements)

module.exports = router