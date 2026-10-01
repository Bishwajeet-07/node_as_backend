const express = require('express')
const router = express.Router()

const { createCategory, getCategories } = require('../controllers/category.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.use(authMiddleware) // Saare category routes protected hain

router.post('/', createCategory)
router.get('/', getCategories)

module.exports = router