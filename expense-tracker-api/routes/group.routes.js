const express = require('express')
const router = express.Router()

const {
    createGroup,
    getMyGroups,
    getGroupById,
    addMember
} = require('../controllers/group.controller')

const authMiddleware = require('../middleware/auth.middleware')

// Saare routes protected hain (Login zaroori hai)
router.use(authMiddleware)

router.post('/', createGroup)
router.get('/', getMyGroups)
router.get('/:id', getGroupById)
router.post('/:id/members', addMember)

module.exports = router