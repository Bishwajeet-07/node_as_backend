const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const asyncHandler = require('../utils/asyncHandler')

// Helper function: Token banane ke liye
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// 1. REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, defaultCurrency } = req.body

    // Check karo email pehle se hai ya nahi
    const existingUser = await User.findOne({ email })
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered!' })
    }

    // Password Hash karo
    const hashedPassword = await bcrypt.hash(password, 10)

    // User save karo DB mein
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        defaultCurrency: defaultCurrency || 'INR'
    })

    // Token banao
    const token = generateToken(user._id)

    res.status(201).json({
        success: true,
        message: 'User registered successfully! 🎉',
        token,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            defaultCurrency: user.defaultCurrency
        }
    })
})

// 2. LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required!' })
    }

    // User search karo
    const user = await User.findOne({ email })
    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid Email or Password!' })
    }

    // Password verify karo
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid Email or Password!' })
    }

    const token = generateToken(user._id)

    res.status(200).json({
        success: true,
        message: 'Login successful! 🚀',
        token,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            defaultCurrency: user.defaultCurrency,
            avatar: user.avatar
        }
    })
})

// 3. GET CURRENT LOGGED-IN USER PROFILE
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId).select('-password')
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found!' })
    }

    res.status(200).json({
        success: true,
        data: user
    })
})

module.exports = {
    registerUser,
    loginUser,
    getMe
}