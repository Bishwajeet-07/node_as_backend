const File = require('../models/file.model')

const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Koi file nahi mili!' })
        }

        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`

        // ⭐ DB mein save karo
        const file = await File.create({
            filename: req.file.filename,
            originalname: req.file.originalname,
            url: fileUrl,
            size: req.file.size,
            uploadedBy: req.user.userId   // ← Token se aaya!
        })

        res.status(201).json({
            success: true,
            message: 'File upload ho gayi!',
            data: file
        })

    } catch (error) {
        next(error)
    }
}

const getMyFiles = async (req, res, next) => {
    try {
        const files = await File.find({ uploadedBy: req.user.userId })
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: files.length,
            data: files
        })
    } catch (error) {
        next(error)
    }
}

// Export mein add karo:
module.exports = { uploadFile, getMyFiles }