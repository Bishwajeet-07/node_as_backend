const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const helmet = require('helmet')
const morgan = require('morgan')

const todoRoutes = require('./routes/todo.routes.js')
const authRoutes = require('./routes/auth.routes.js')
const uploadRoutes = require('./routes/upload.routes.js')
const profileRoutes = require('./routes/profile.routes.js')
const { globalLimiter } = require('./middleware/rateLimiter.middleware.js')



const app = express()
// Helmet ko bolo ki Images ko Cross-Origin (Frontend) par allow kare:
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))// Security Middleware — HTTP Headers ko secure karne ke liye

// Middleware
// 2. Strict CORS (Sirf tumhari Frontend Website ko allow karo)
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:1974', 'http://localhost:1975', 'http://localhost:3000'] // Tumhara React App URL
app.use(cors({
    origin: function (origin, callback) {
        // Postman ya same domain se empty origin aatha hai, use allow karo
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('CORS Policy se blocked! Is Domain ko allow nahi hai.'))
        }
    },
    credentials: true // Cookies / Headers allow karne ke liye
}))

app.use(express.json())
app.use(morgan('dev')) // Logging Middleware — Development ke liye

app.use('/uploads', cors(), express.static('uploads'))

// Apply the global rate limiter to all routes
app.use(globalLimiter)

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