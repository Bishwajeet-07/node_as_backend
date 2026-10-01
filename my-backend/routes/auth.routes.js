const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller.js");
const validate = require("../middleware/validate.middleware.js")
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const { authLimiter } = require("../middleware/rateLimiter.middleware.js");

router.post('/register', authLimiter, validate(registerSchema), authController.registerUser)
router.post('/login', authLimiter, validate(loginSchema), authController.loginUser)

module.exports = router;