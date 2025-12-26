const Settlement = require('../models/Settlement');
const Group = require('../models/Group');

exports.createSettlement = async (req, res) => {
    try {
        const { groupId, payeeId, amount } = req.body;
        // Payer is the logged in user

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ msg: 'Group not found' });

        const settlement = new Settlement({
            group: groupId,
            payer: req.user.id,
            payee: payeeId,
            amount: Number(amount)
        });

        await settlement.save();
        res.json(settlement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
