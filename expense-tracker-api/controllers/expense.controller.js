const Expense = require('../models/expense.model')
const asyncHandler = require('../utils/asyncHandler')

// 1. Naya Expense Add Karo
const createExpense = asyncHandler(async (req, res) => {
    const { title, amount, category, paymentMethod, date, notes } = req.body

    const expense = await Expense.create({
        title,
        amount,
        category, //  Category ki ID aayegi frontend se!
        user: req.user.userId,
        paymentMethod,
        date,
        notes
    })

    res.status(201).json({
        success: true,
        message: 'Expense added successfully! 💸',
        data: expense
    })
})

// 2. Apne Saare Expenses Laao (YAHAN RELATION POPULATE HOGA!)
const getMyExpenses = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({ user: req.user.userId })
        .populate('category', 'name icon color') // 👈 MAGIC LINE: ID ki jagah Category details chipka dega!
        .sort({ date: -1 })

    res.status(200).json({
        success: true,
        count: expenses.length,
        data: expenses
    })
})

module.exports = {
    createExpense,
    getMyExpenses
}