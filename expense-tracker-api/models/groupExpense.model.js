const mongoose = require('mongoose')

const groupExpenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Expense title zaroori hai!'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount zaroori hai!'],
        min: [1, 'Amount kam se kam 1 hona chahiye!']
    },
    // 🔗 RELATION 1: Kis Group ka kharcha hai?
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    // 🔗 RELATION 2: Kisne paise bhare? (Payer)
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 🔗 RELATION 3: Optional Category
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    splitType: {
        type: String,
        enum: ['EQUAL', 'EXACT'],
        default: 'EQUAL'
    },
    // 🔗 RELATION 4: Har member ka kitna hissa bana? (Array of Splits)
    splits: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            amount: {
                type: Number,
                required: true
            }
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('GroupExpense', groupExpenseSchema)