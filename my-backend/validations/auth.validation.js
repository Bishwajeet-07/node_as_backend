const { z } = require('zod')

const registerSchema = z.object({
    username: z.string().min(3, 'Username kam se kam 3 chars ka hona chahiye'),
    email: z.string().email('Invalid Email Address!'),
    password: z.string().min(6, 'Password kam se kam 6 chars ka hona chahiye')
})

const loginSchema = z.object({
    email: z.string().email('Invalid Email Address!'),
    password: z.string().min(1, 'Password kam se kam 6 chars ka hona chahiye')
})

module.exports = { registerSchema, loginSchema }