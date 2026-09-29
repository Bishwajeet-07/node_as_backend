const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res, next) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });
        res.status(201).json({
            success: true, message: 'User registered successfully', data: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
};

const loginUser = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(200).json({
            success: true, token, data: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    registerUser,
    loginUser
};