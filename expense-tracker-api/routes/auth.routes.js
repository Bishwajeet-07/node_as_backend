const express = require('express')
const router = express.Router()

const {
    registerUser,
    loginUser,
    getMe
} = require('../controllers/auth.controller')

const authMiddleware = require('../middleware/auth.middleware')

// Public routes (Bina login ke chalenge)
router.post('/register', registerUser)
router.post('/login', loginUser)

// Protected route (Token chahiye)
router.get('/me', authMiddleware, getMe)

module.exports = router