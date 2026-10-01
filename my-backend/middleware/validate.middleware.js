const validate = (schema) => (req, res, next) => {
    // safeParse try-catch ki jagah result Object deta hai: { success: true/false }
    const result = schema.safeParse(req.body)

    if (!result.success) {
        // Validation Fail ho gaya!
        return res.status(400).json({
            success: false,
            message: 'Validation Error!',
            errors: result.error.issues.map(issue => ({
                field: issue.path.join('.'), // Field Name (e.g. "password")
                message: issue.message       // Error Message (e.g. "Password kam se kam 6 chars ka hona chahiye")
            }))
        })
    }

    // Sab sahi hai -> Clean data req.body mein daalo aur aage badho
    req.body = result.data
    next()
}

module.exports = validate