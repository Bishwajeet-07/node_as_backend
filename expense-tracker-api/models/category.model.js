const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required!'],
        trim: true
    },
    icon: {
        type: String,
        default: '💸' // Emoji ya Icon name (jaise 🍕, 🚗, 🏠, 🎬)
    },
    color: {
        type: String,
        default: '#6366f1' // UI mein dikhane ke liye hex color
    },
    // Kis user ne banayi? (Agar null hai toh default global category hai)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Category', categorySchema)