const multer = require('multer')
const path = require('path')

// Storage define karo — file kahan aur kis naam se save ho
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'uploads/')   // ← Kahan save karo
    },

    filename: (req, file, cb) => {

        // Unique naam — timestamp + original naam
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-')
        cb(null, uniqueName)
    }

})

// Filter — sirf images allow karo
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg']
    if (allowed.includes(file.mimetype)) {
        cb(null, true)   // ✅ Allow
    } else {
        cb(new Error('Sirf JPG/PNG images allowed hain!'), false) // ❌ Reject
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }  // Max 2MB
})

module.exports = upload