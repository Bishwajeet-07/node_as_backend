const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const todoRoutes = require('./routes/todo.routes.js')
const authRoutes = require('./routes/auth.routes.js')
const uploadRoutes = require('./routes/upload.routes.js')
const profileRoutes = require('./routes/profile.routes.js')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/todos', todoRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/profile', profileRoutes)

// Error Middleware — Sabse last!
app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server Error!'
    })
})

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB')
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT || 5000}`)
    })
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err)
})