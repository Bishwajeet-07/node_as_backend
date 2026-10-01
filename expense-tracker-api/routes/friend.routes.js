const express = require('express')
const router = express.Router()

const { getMyFriends, addFriend, removeFriend } = require('../controllers/friend.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.use(authMiddleware)

router.get('/', getMyFriends)
router.post('/', addFriend)
router.delete('/:id', removeFriend)
module.exports = router