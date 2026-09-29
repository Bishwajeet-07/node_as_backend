const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalname: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    size: {
        type: Number
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('File', fileSchema)