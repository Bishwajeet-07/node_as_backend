const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Expense title is required!'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required!'],
        min: [0, 'Amount 0 se bada hona chahiye!']
    },
    date: {
        type: Date,
        default: Date.now
    },
    // 🔗 RELATION 1: Kis Category ka kharcha hai?
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Category Model se link kiya!
        required: [true, 'Category is required!']
    },
    // 🔗 RELATION 2: Kis User ka kharcha hai? (Ownership)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // User Model se link kiya!
        required: [true, 'User is required!']
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'UPI', 'Card', 'Net Banking'],
        default: 'UPI'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Expense', expenseSchema)