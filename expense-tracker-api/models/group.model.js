const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required!'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // Kisne group banaya? (Admin/Creator)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 🔗 MANY-TO-MANY RELATION: Saare Group Members ki list
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, {
  timestamps: true
})

module.exports = mongoose.model('Group', groupSchema)