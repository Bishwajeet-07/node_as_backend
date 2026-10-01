const mongoose = require('mongoose')

const settlementSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    // Kisne paise diye? (Payer, e.g. bk)
    payer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Kisko paise mile? (Receiver, e.g. bks)
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Settlement amount zaroori hai!'],
        min: [1, 'Amount kam se kam 1 hona chahiye!']
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'UPI', 'Bank Transfer'],
        default: 'UPI'
    },
    notes: {
        type: String,
        default: 'Settled up'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Settlement', settlementSchema)