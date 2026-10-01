const User = require('../models/user.model')
const asyncHandler = require('../utils/asyncHandler')

// 1. Saare Friends Dekho (Auto Clean Dirty Data & Duplicates)
const getMyFriends = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId)
        .populate('friends', 'name email avatar defaultCurrency')

    // 🧹 Auto-clean: Agar pehle se self ya duplicate ho gaya tha, toh unhe hatao
    const uniqueFriends = []
    const seenIds = new Set()

    for (const friend of user.friends) {
        if (!friend) continue
        const friendId = friend._id.toString()

        // Na khud ka ID aane do, na duplicate aane do:
        if (friendId !== req.user.userId.toString() && !seenIds.has(friendId)) {
            seenIds.add(friendId)
            uniqueFriends.push(friend)
        }
    }

    // Database ko bhi clean update kar do
    if (user.friends.length !== uniqueFriends.length) {
        user.friends = Array.from(seenIds)
        await user.save()
    }

    res.status(200).json({
        success: true,
        count: uniqueFriends.length,
        data: uniqueFriends
    })
})

// 2. Naya Friend Add Karo (With Strict Validation & $addToSet)
const addFriend = asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ success: false, message: 'Friend ka email zaroori hai!' })
    }

    // 1. Dost ko DB mein search karo
    const friendUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (!friendUser) {
        return res.status(404).json({ success: false, message: 'Is email se koi user registered nahi hai!' })
    }

    // 🛑 2. SELF-CHECK BY ID: Kya user ne khud ki hi ID dhundh li?
    if (friendUser._id.toString() === req.user.userId.toString()) {
        return res.status(400).json({
            success: false,
            message: 'Aap khud ko friend list mein add nahi kar sakte! 🚫'
        })
    }

    const currentUser = await User.findById(req.user.userId)

    // 🛑 3. DUPLICATE CHECK: Kya yeh banda pehle se friend hai?
    const isAlreadyFriend = currentUser.friends.some(
        id => id.toString() === friendUser._id.toString()
    )

    if (isAlreadyFriend) {
        return res.status(400).json({
            success: false,
            message: `${friendUser.name} pehle se aapki friend list mein hai!`
        })
    }

    // 4. Dono ko ek dusre ka friend banao (Atomic $addToSet ensures ZERO duplicates!)
    await User.findByIdAndUpdate(req.user.userId, {
        $addToSet: { friends: friendUser._id }
    })

    await User.findByIdAndUpdate(friendUser._id, {
        $addToSet: { friends: req.user.userId }
    })

    res.status(200).json({
        success: true,
        message: `${friendUser.name} aapki friend list mein add ho gaya! 🤝`,
        data: {
            _id: friendUser._id,
            name: friendUser.name,
            email: friendUser.email,
            avatar: friendUser.avatar
        }
    })
})

// 3. Friend Remove Karo (Unfriend)
const removeFriend = asyncHandler(async (req, res) => {
    const { id: friendId } = req.params

    // Dono taraf se dosti khatam ($pull operator se array se remove karo)
    await User.findByIdAndUpdate(req.user.userId, {
        $pull: { friends: friendId }
    })

    await User.findByIdAndUpdate(friendId, {
        $pull: { friends: req.user.userId }
    })

    res.status(200).json({
        success: true,
        message: 'Friend successfully removed from your list! 🗑️'
    })
})

module.exports = {
    getMyFriends,
    addFriend,
    removeFriend
}