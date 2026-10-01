const Category = require('../models/category.model')

const defaultCategories = [
    { name: 'Food & Dining', icon: '🍕', color: '#f59e0b', user: null },
    { name: 'Travel & Transport', icon: '🚗', color: '#3b82f6', user: null },
    { name: 'Shopping', icon: '🛍️', color: '#ec4899', user: null },
    { name: 'Bills & Utilities', icon: '💡', color: '#10b981', user: null },
    { name: 'Rent & Housing', icon: '🏠', color: '#8b5cf6', user: null },
    { name: 'Entertainment', icon: '🎬', color: '#ef4444', user: null },
    { name: 'Medical & Health', icon: '💊', color: '#06b6d4', user: null },
    { name: 'Groceries', icon: '🛒', color: '#84cc16', user: null }
]

const seedDefaultCategories = async () => {
    try {
        // Check karo kya pehle se default categories hain?
        const count = await Category.countDocuments({ user: null })
        if (count === 0) {
            await Category.insertMany(defaultCategories)
            console.log('✅ Default Categories seeded successfully!')
        }
    } catch (error) {
        console.error('❌ Error seeding categories:', error.message)
    }
}

module.exports = seedDefaultCategories