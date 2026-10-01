const GroupExpense = require('../models/groupExpense.model')
const Group = require('../models/group.model')
const asyncHandler = require('../utils/asyncHandler')
const Settlement = require('../models/settlement.model')

// 1. Group Expense Add Karo (Auto Equal Split OR Manual Exact Split)
const addGroupExpense = asyncHandler(async (req, res) => {
    const {
        title,
        amount,
        groupId,
        categoryId,
        paidBy,       // Kisne pay kiya? (Optional, default: logged-in user)
        splitType,    // 'EQUAL' ya 'EXACT' (default: 'EQUAL')
        splitMembers, // Agar EQUAL mein sirf specific members ko split karna ho: [userId1, userId2]
        customSplits  // Agar EXACT split ho: [{ user: userId1, amount: 2000 }, { user: userId2, amount: 3000 }]
    } = req.body

    if (!title || !amount || !groupId) {
        return res.status(400).json({
            success: false,
            message: 'Title, amount aur groupId zaroori hain!'
        })
    }

    // Step 1: Check karo group exist karta hai aur caller member hai
    const group = await Group.findOne({ _id: groupId, members: req.user.userId })
    if (!group) {
        return res.status(404).json({
            success: false,
            message: 'Group nahi mila ya aap is group ke member nahi ho!'
        })
    }

    // Step 2: Validate Payer (Kisne pay kiya)
    const payerId = paidBy || req.user.userId
    if (!group.members.some(id => id.toString() === payerId.toString())) {
        return res.status(400).json({
            success: false,
            message: 'Payer is group ka member hona chahiye!'
        })
    }

    let finalSplits = []

    // ─────────────────────────────────────────────────────────────
    // CASE 1: MANUAL / EXACT SPLIT (Custom Amounts)
    // ─────────────────────────────────────────────────────────────
    if (splitType === 'EXACT') {
        if (!customSplits || !Array.isArray(customSplits) || customSplits.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'EXACT split ke liye customSplits array zaroori hai!'
            })
        }

        // A) Check karo sabhi custom split users group ke members hain
        for (const item of customSplits) {
            if (!group.members.some(id => id.toString() === item.user.toString())) {
                return res.status(400).json({
                    success: false,
                    message: `User ${item.user} group ka member nahi hai!`
                })
            }
        }

        // B) Check karo: Saare hisso ka Total == Total Amount hona chahiye!
        const totalCustomSplit = customSplits.reduce((acc, curr) => acc + Number(curr.amount), 0)
        if (Math.abs(totalCustomSplit - Number(amount)) > 0.01) {
            return res.status(400).json({
                success: false,
                message: `Splits ka total (₹${totalCustomSplit}) expense amount (₹${amount}) ke barabar hona chahiye!`
            })
        }

        finalSplits = customSplits.map(item => ({
            user: item.user,
            amount: Number(item.amount)
        }))

        // ─────────────────────────────────────────────────────────────
        // CASE 2: AUTO EQUAL SPLIT (Default)
        // ─────────────────────────────────────────────────────────────
    } else {
        // Agar frontend ne splitMembers bheje hain toh unme split karo, warna saare group members mein
        const targetMembers = (splitMembers && splitMembers.length > 0)
            ? splitMembers
            : group.members

        // Check karo target members group mein hain ya nahi
        for (const memberId of targetMembers) {
            if (!group.members.some(id => id.toString() === memberId.toString())) {
                return res.status(400).json({
                    success: false,
                    message: `User ${memberId} is group ka member nahi hai!`
                })
            }
        }

        const count = targetMembers.length
        const splitAmount = Math.round((amount / count) * 100) / 100

        finalSplits = targetMembers.map((memberId) => ({
            user: memberId,
            amount: splitAmount
        }))
    }

    // Step 3: Database mein Expense save karo
    const expense = await GroupExpense.create({
        title,
        amount: Number(amount),
        group: groupId,
        paidBy: payerId,
        category: categoryId || null,
        splitType: splitType || 'EQUAL',
        splits: finalSplits
    })

    await expense.populate('paidBy', 'name email avatar')
    await expense.populate('splits.user', 'name email avatar')

    res.status(201).json({
        success: true,
        message: splitType === 'EXACT'
            ? 'Group expense added with Manual Exact Split! 📝'
            : 'Group expense added with Auto Equal Split! 🍕',
        data: expense
    })
})

// 2. Kisi Group ke Saare Expenses Dekho
const getGroupExpenses = asyncHandler(async (req, res) => {
    const { groupId } = req.params

    const group = await Group.findOne({ _id: groupId, members: req.user.userId })
    if (!group) {
        return res.status(404).json({
            success: false,
            message: 'Group nahi mila ya aap isme nahi ho!'
        })
    }

    const expenses = await GroupExpense.find({ group: groupId })
        .populate('paidBy', 'name email avatar')
        .populate('splits.user', 'name email avatar')
        .sort({ createdAt: -1 })

    res.status(200).json({
        success: true,
        count: expenses.length,
        data: expenses
    })
})


// 3. Group ka Pura Hisaab-Kitaab (Balances & Who Owes Whom)
const getGroupBalances = asyncHandler(async (req, res) => {
    const { groupId } = req.params

    // 1. Group check karo
    const group = await Group.findOne({ _id: groupId, members: req.user.userId })
        .populate('members', 'name email avatar')

    if (!group) {
        return res.status(404).json({ success: false, message: 'Group nahi mila ya aap isme nahi ho!' })
    }


    // 2. Group ke saare kharche AUR settlements nikalo
    const expenses = await GroupExpense.find({ group: groupId })
    const settlementsList = await Settlement.find({ group: groupId }) // 👈 YEH LINE ADD KARO!

    // 3. Har member ka Net Balance calculate karo
    // { userId: { name, email, avatar, netBalance, totalPaid, totalShare } }
    const memberBalances = {}

    group.members.forEach((member) => {
        memberBalances[member._id.toString()] = {
            _id: member._id,
            name: member.name,
            email: member.email,
            avatar: member.avatar,
            totalPaid: 0,
            totalShare: 0,
            netBalance: 0
        }
    })

    // Kharche iterate karo
    expenses.forEach((expense) => {
        const payerId = expense.paidBy.toString()

        // Jisne pay kiya uske totalPaid mein jodo
        if (memberBalances[payerId]) {
            memberBalances[payerId].totalPaid += expense.amount
        }

        // Har member ke hisse ka share jodo
        expense.splits.forEach((split) => {
            const splitUserId = split.user.toString()
            if (memberBalances[splitUserId]) {
                memberBalances[splitUserId].totalShare += split.amount
            }
        })
    })

    // Settlements (Chukaye hue paise) ko jodo
    settlementsList.forEach((st) => {
        const payerId = st.payer.toString()
        const receiverId = st.receiver.toString()

        // Payer ne paisa wapas diya, toh usne "Pay" kiya:
        if (memberBalances[payerId]) {
            memberBalances[payerId].totalPaid += st.amount
        }
        // Receiver ko paisa mil gaya, toh uska "Hissa" kam hua:
        if (memberBalances[receiverId]) {
            memberBalances[receiverId].totalShare += st.amount
        }
    })

    // Final Net Balance nikalo (totalPaid - totalShare)
    Object.values(memberBalances).forEach((member) => {
        member.netBalance = Math.round((member.totalPaid - member.totalShare) * 100) / 100
    })

    // 4. "Kaun kisse kitna maangta hai" (Simplified Debts)
    const debtors = []  // Jinko dena hai (Negative)
    const creditors = [] // Jinko milna hai (Positive)

    Object.values(memberBalances).forEach((m) => {
        if (m.netBalance < -0.01) {
            debtors.push({ ...m, amountOwed: Math.abs(m.netBalance) })
        } else if (m.netBalance > 0.01) {
            creditors.push({ ...m, amountReceivable: m.netBalance })
        }
    })

    const settlements = [] // Final "Who pays Whom" list

    let i = 0
    let j = 0

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i]
        const creditor = creditors[j]

        const settledAmount = Math.min(debtor.amountOwed, creditor.amountReceivable)

        if (settledAmount > 0.01) {
            settlements.push({
                from: { _id: debtor._id, name: debtor.name, email: debtor.email },
                to: { _id: creditor._id, name: creditor.name, email: creditor.email },
                amount: Math.round(settledAmount * 100) / 100
            })
        }

        debtor.amountOwed -= settledAmount
        creditor.amountReceivable -= settledAmount

        if (debtor.amountOwed <= 0.01) i++
        if (creditor.amountReceivable <= 0.01) j++
    }


    res.status(200).json({
        success: true,
        data: {
            groupId: group._id,
            groupName: group.name,
            totalExpensesCount: expenses.length,
            membersSummary: Object.values(memberBalances),
            settlements // 👈 Exact list: "Rahul pays ₹500 to Viswa"
        }
    })
})

// 4. Settle Up (Paise chukana)
const settlePayment = asyncHandler(async (req, res) => {
    const { groupId } = req.params
    const { receiverId, amount, paymentMethod, notes } = req.body

    if (!receiverId || !amount) {
        return res.status(400).json({ success: false, message: 'receiverId aur amount zaroori hain!' })
    }

    // Check group membership
    const group = await Group.findOne({ _id: groupId, members: req.user.userId })
    if (!group) {
        return res.status(404).json({ success: false, message: 'Group nahi mila ya aap member nahi ho!' })
    }

    // Check receiver group ka member hai ya nahi
    if (!group.members.some(id => id.toString() === receiverId.toString())) {
        return res.status(400).json({ success: false, message: 'Receiver is group ka member nahi hai!' })
    }

    const settlement = await Settlement.create({
        group: groupId,
        payer: req.user.userId, // Jo login hai usne paisa wapas diya
        receiver: receiverId,
        amount: Number(amount),
        paymentMethod: paymentMethod || 'UPI',
        notes: notes || 'Settled up'
    })

    await settlement.populate('payer', 'name email avatar')
    await settlement.populate('receiver', 'name email avatar')

    res.status(201).json({
        success: true,
        message: `Payment of ₹${amount} recorded successfully! 🤝`,
        data: settlement
    })
})

// 5. Group ki Saari Settlement History / Payment Logs Dekho
const getGroupSettlements = asyncHandler(async (req, res) => {
    const { groupId } = req.params

    // Check karo kya group exist karta hai aur caller iska member hai?
    const group = await Group.findOne({ _id: groupId, members: req.user.userId })
    if (!group) {
        return res.status(404).json({
            success: false,
            message: 'Group nahi mila ya aap isme nahi ho!'
        })
    }

    // Saare payment logs nikaalo (Latest pehle)
    const settlements = await Settlement.find({ group: groupId })
        .populate('payer', 'name email avatar')
        .populate('receiver', 'name email avatar')
        .sort({ createdAt: -1 }) // Sabse taaza payment sabse upar!

    // Total kitna paisa settle ho chuka hai (Summary)
    const totalSettledAmount = settlements.reduce((sum, item) => sum + item.amount, 0)

    res.status(200).json({
        success: true,
        count: settlements.length,
        totalSettledAmount,
        data: settlements
    })
})

module.exports = {
    addGroupExpense,
    getGroupExpenses,
    getGroupBalances,
    settlePayment,
    getGroupSettlements
}