// asyncHandler: Ek function jo dusre async function ko wrap karta hai
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err))
}

module.exports = asyncHandler