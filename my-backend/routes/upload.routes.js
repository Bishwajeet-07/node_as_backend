const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload.middleware')
const { uploadFile, getMyFiles } = require('../controllers/upload.controller')
const authMiddleware = require('../middleware/auth.middleware')

// Auth + Upload middleware + Controller
router.post('/', authMiddleware, upload.single('image'), uploadFile)
//                                          ↑
//                              Form field ka naam
router.get("/", authMiddleware, getMyFiles)

module.exports = router