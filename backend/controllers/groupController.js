const Group = require('../models/Group');
const User = require('../models/User');
const { calculateBalances, simplifyDebts } = require('../utils/balance');

exports.createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;

        const group = new Group({
            name,
            members: [...members, req.user.id], // Add creator
            createdBy: req.user.id
        });

        await group.save();
        res.json(group);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user.id }).populate('members', 'name email');
        res.json(groups);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getGroupDetails = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name email')
            .populate('createdBy', 'name');

        if (!group) return res.status(404).json({ msg: 'Group not found' });

        // Calculate Balances On-Demand
        const rawBalances = await calculateBalances(group._id);
        const simplified = simplifyDebts(rawBalances);

        res.json({
            group,
            balances: simplified,
            rawBalances
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.addMember = async (req, res) => {
    try {
        const email = req.body.email.trim();
        console.log(`[AddMember] Request to add ${email} to group ${req.params.id}`);

        const group = await Group.findById(req.params.id);
        if (!group) {
            console.log('[AddMember] Group not found');
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Find user by email (case-insensitive)
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (!user) {
            console.log('[AddMember] User email not found');
            return res.status(404).json({ msg: 'User with this email does not exist' });
        }

        // Check if already member (robust ObjectId comparison)
        const isMember = group.members.some(memberId => memberId.toString() === user.id);
        if (isMember) {
            console.log('[AddMember] User already in group');
            return res.status(400).json({ msg: 'User is already a member of this group' });
        }

        group.members.push(user.id);
        await group.save();

        console.log('[AddMember] Success');
        res.json(group);
    } catch (err) {
        console.error('[AddMember] Error:', err.message);
        res.status(500).send('Server error');
    }
};
