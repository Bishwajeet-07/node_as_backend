const Category = require('../models/category.model')
const asyncHandler = require('../utils/asyncHandler')

// 1. Nayi Category Banao
const createCategory = asyncHandler(async (req, res) => {
    const { name, icon, color } = req.body

    const category = await Category.create({
        name,
        icon,
        color,
        user: req.user.userId
    })

    res.status(201).json({
        success: true,
        data: category
    })
})

// 2. Saari Categories Laao (Jo user ne banayi hain ya default hain)
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({
        $or: [
            { user: req.user.userId },
            { user: null } // Global/Default categories
        ]
    })

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    })
})

module.exports = {
    createCategory,
    getCategories
}