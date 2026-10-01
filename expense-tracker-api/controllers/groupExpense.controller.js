const GroupExpense = require('../models/groupExpense.model')
const Group = require('../models/group.model')
const asyncHandler = require('../utils/asyncHandler')

// 1. Group Expense Add Karo (Auto Equal Split)
const addGroupExpense = asyncHandler(async (req, res) => {
    const { title, amount, groupId, categoryId } = req.body

    if (!title || !amount || !groupId) {
        return res.status(400).json({
            success: false,
            message: 'Title, amount aur groupId sab zaroori hain!'
        })
    }

    // Step 1: Check karo group exist karta hai aur kya logged-in user iska member hai?
    const group = await Group.findOne({ _id: groupId, members: req.user.userId })
    if (!group) {
        return res.status(404).json({
            success: false,
            message: 'Group nahi mila ya aap is group ke member nahi ho!'
        })
    }

    // Step 2: Equal Split Calculate Karo
    const totalMembers = group.members.length
    const splitAmount = Math.round((amount / totalMembers) * 100) / 100 // 2 decimal places

    // Har member ke liye split object banao
    const splits = group.members.map((memberId) => ({
        user: memberId,
        amount: splitAmount
    }))

    // Step 3: Database mein Expense save karo
    const expense = await GroupExpense.create({
        title,
        amount,
        group: groupId,
        paidBy: req.user.userId, // Jo login hai usne pay kiya
        category: categoryId || null,
        splitType: 'EQUAL',
        splits
    })

    // Populated response return karo
    await expense.populate('paidBy', 'name email')
    await expense.populate('splits.user', 'name email')

    res.status(201).json({
        success: true,
        message: 'Group expense added & split equally! 🎉',
        data: expense
    })
})

// 2. Kisi Group ke Saare Expenses Dekho
const getGroupExpenses = asyncHandler(async (req, res) => {
    const { groupId } = req.params

    // Check group membership
    const group = await Group.findOne({ _id: groupId, members: req.user.userId })
    if (!group) {
        return res.status(404).json({
            success: false,
            message: 'Group nahi mila ya aap isme nahi ho!'
        })
    }

    const expenses = await GroupExpense.find({ group: groupId })
        .populate('paidBy', 'name email')
        .populate('splits.user', 'name email')
        .sort({ createdAt: -1 })

    res.status(200).json({
        success: true,
        count: expenses.length,
        data: expenses
    })
})

module.exports = {
    addGroupExpense,
    getGroupExpenses
}