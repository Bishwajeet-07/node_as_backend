const Group = require('../models/group.model')
const User = require('../models/user.model')
const GroupExpense = require('../models/groupExpense.model')
const asyncHandler = require('../utils/asyncHandler')

// 1. Naya Group Banao
// 1. Naya Group Banao (Optionally Friends ki ID list pass kar sakte ho)
const createGroup = asyncHandler(async (req, res) => {
    const { name, description, memberIds } = req.body // 👈 memberIds le sakte hain!

    if (!name) {
        return res.status(400).json({ success: false, message: 'Group name zaroori hai!' })
    }

    // Creator ko hamesha list mein rakho
    const initialMembers = [req.user.userId]

    // Agar user ne friend list se dost select karke bheje hain toh unhe bhi add karo:
    if (memberIds && Array.isArray(memberIds)) {
        memberIds.forEach((id) => {
            if (id.toString() !== req.user.userId.toString() && !initialMembers.includes(id)) {
                initialMembers.push(id)
            }
        })
    }

    const group = await Group.create({
        name,
        description: description || '',
        createdBy: req.user.userId,
        members: initialMembers
    })

    await group.populate('members', 'name email avatar')

    res.status(201).json({
        success: true,
        message: 'Group created successfully with selected friends! 👥🎉',
        data: group
    })
})

// 2. Apne Saare Groups Dekho (Jahan main member hoon)
const getMyGroups = asyncHandler(async (req, res) => {
    // MongoDB Magic: Agar 'members' array mein req.user.userId hai, toh wo group nikal lo!
    const groups = await Group.find({ members: req.user.userId })
        .populate('createdBy', 'name email')
        .populate('members', 'name email avatar') // 👈 Saare members ki details populate hongi!
        .sort({ createdAt: -1 })

    res.status(200).json({
        success: true,
        count: groups.length,
        data: groups
    })
})

// 3. Single Group ki Details Dekho
const getGroupById = asyncHandler(async (req, res) => {
    const group = await Group.findOne({
        _id: req.params.id,
        members: req.user.userId // Security: Sirf wahi dekh sake jo member ho!
    })
        .populate('createdBy', 'name email')
        .populate('members', 'name email avatar')

    if (!group) {
        return res.status(404).json({ success: false, message: 'Group nahi mila ya aap member nahi ho!' })
    }

    res.status(200).json({
        success: true,
        data: group
    })
})

// 4. Dost ko Group mein Add Karo (By Email)
const addMember = asyncHandler(async (req, res) => {
    const { email } = req.body
    const groupId = req.params.id

    if (!email) {
        return res.status(400).json({ success: false, message: 'Friend ka email zaroori hai!' })
    }

    // 1. Dost ko search karo DB mein
    const userToAdd = await User.findOne({ email })
    if (!userToAdd) {
        return res.status(404).json({ success: false, message: 'Is email se koi user registered nahi hai!' })
    }

    // 2. Group dhundho (aur check karo kya caller group ka member hai)
    const group = await Group.findOne({ _id: groupId, members: req.user.userId })
    if (!group) {
        return res.status(404).json({ success: false, message: 'Group nahi mila ya aap isme nahi ho!' })
    }

    // 3. Check karo kya dost pehle se member hai?
    if (group.members.includes(userToAdd._id)) {
        return res.status(400).json({ success: false, message: 'User pehle se is group ka member hai!' })
    }

    // 4. Member add karo aur save karo
    group.members.push(userToAdd._id)
    await group.save()

    // Updated group return karo populated members ke saath
    await group.populate('members', 'name email avatar')

    res.status(200).json({
        success: true,
        message: `${userToAdd.name} ko group mein add kar diya! 🎉`,
        data: group
    })
})

// 5. Delete Group (Sirf Admin kar sakta hai + Cascade Delete)
const deleteGroup = asyncHandler(async (req, res) => {
    const groupId = req.params.id

    const group = await Group.findById(groupId)
    if (!group) {
        return res.status(404).json({ success: false, message: 'Group nahi mila!' })
    }

    // 🛡️ ADMIN CHECK: Kya request bhejne wala wahi hai jisne group banaya?
    if (group.createdBy.toString() !== req.user.userId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access Denied! Sirf Group Admin hi group delete kar sakta hai! 🚫'
        })
    }

    // 🧹 CASCADE DELETE: Group ke saare kharche bhi database se saaf karo!
    await GroupExpense.deleteMany({ group: groupId })

    // Group delete karo
    await Group.findByIdAndDelete(groupId)

    res.status(200).json({
        success: true,
        message: 'Group aur uske saare expenses successfully delete ho gaye! 🗑️'
    })
})

// 6. Member ko Group se Remove Karo (Admin nikaal sakta hai ya user khud leave kar sakta hai)
const removeMember = asyncHandler(async (req, res) => {
    const { id: groupId, memberId } = req.params

    const group = await Group.findById(groupId)
    if (!group) {
        return res.status(404).json({ success: false, message: 'Group nahi mila!' })
    }

    // Admin ko group se nahi nikaala ja sakta!
    if (memberId.toString() === group.createdBy.toString()) {
        return res.status(400).json({
            success: false,
            message: 'Group Admin ko group se remove nahi kiya ja sakta!'
        })
    }

    // Permission Check: Ya toh Admin nikaal raha ho, ya banda KHUD group chhod raha ho
    const isAdmin = group.createdBy.toString() === req.user.userId.toString()
    const isSelf = memberId.toString() === req.user.userId.toString()

    if (!isAdmin && !isSelf) {
        return res.status(403).json({
            success: false,
            message: 'Aapko kisi doosre member ko nikaalne ka haq nahi hai!'
        })
    }

    // Member ko array se hatao
    group.members = group.members.filter(m => m.toString() !== memberId.toString())
    await group.save()

    await group.populate('members', 'name email avatar')

    res.status(200).json({
        success: true,
        message: isSelf ? 'Aapne group chhod diya! 👋' : 'Member ko group se nikaal diya gaya! 🚪',
        data: group
    })
})

module.exports = {
    createGroup,
    getMyGroups,
    getGroupById,
    addMember,
    deleteGroup,
    removeMember
}