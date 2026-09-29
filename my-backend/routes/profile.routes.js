const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth.middleware')
const { getProfile, updateProfile } = require('../controllers/profile.controller')
const upload = require('../middleware/upload.middleware')

router.use(authMiddleware)

router.get('/', getProfile)
router.put('/update', upload.single('avatar'), updateProfile);

module.exports = router  