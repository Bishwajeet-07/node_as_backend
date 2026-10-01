const rateLimit = require('express-rate-limit')

// 1. General Limiter — Saari APIs ke liye
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes ka Time Window
    max: 100,                  // 15 Minutes mein MAX 100 Requests allowed ek IP se
    message: {
        success: false,
        message: 'Bohot zyada requests bhej di! 15 minute baad try karo.'
    },
    standardHeaders: true, // `RateLimit-*` headers bhejega response mein
    legacyHeaders: false
})

// 2. Strict Limiter — Sirf Login & Register ke liye (Brute-Force Protection 🔐)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes
    max: 5,                    // Max 5 GALAT Attempts allowed
    skipSuccessfulRequests: true, // YEH MAGIC OPTION! (Successful Login ko count nahi karega)
    message: {
        success: false,
        message: 'Bohot baar galat password dala! 15 minute baad try karna.'
    }
})

module.exports = {
    globalLimiter,
    authLimiter
}