const Group = require('../models/group.model')
const User = require('../models/user.model')
const asyncHandler = require('../utils/asyncHandler')

// 1. Naya Group Banao
const createGroup = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name) {
        return res.status(400).json({ success: false, message: 'Group name is required!' })
    }

    // Group banane wala khud automatically pehla member hoga!
    const group = await Group.create({
        name,
        description,
        createdBy: req.user.userId,
        members: [req.user.userId] // Array mein creator ka ID dal diya
    })

    res.status(201).json({
        success: true,
        message: 'Group created successfully! 👥',
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

module.exports = {
    createGroup,
    getMyGroups,
    getGroupById,
    addMember
}