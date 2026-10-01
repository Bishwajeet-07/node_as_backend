const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler.js');

const getProfile = asyncHandler(async (req, res, next) => {
    const userId = req.user.userId; //  req.user.userId
    const user = await User.findById(userId).select('-password');

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
        success: true,
        data: user
    });

})

const updateProfile = asyncHandler(async (req, res, next) => {
    const userId = req.user.userId; // 👈 req.user.userId
    const { username, email, bio, phone } = req.body;

    // Avatar URL banayein agar file upload hui hai
    const avatarUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : undefined;

    const updatedData = {
        username,
        email,
        bio,
        phone
    };

    // Agar avatar upload hua hai tabhi avatar field update karo
    if (avatarUrl) {
        updatedData.avatar = avatarUrl;
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select('-password');

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
    });
}
)

module.exports = {
    getProfile,
    updateProfile
}