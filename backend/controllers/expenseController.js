const Expense = require('../models/Expense');
const Group = require('../models/Group');

exports.addExpense = async (req, res) => {
    try {
        const { groupId, amount, description, splitType, splits } = req.body;
        // splits input: [{ userId, amount?, percentage? }]

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ msg: 'Group not found' });

        // Calculate 'owed' for each split based on type
        let processedSplits = [];
        let totalOwed = 0;

        if (splitType === 'EQUAL') {
            const share = amount / splits.length;
            // Handle rounding logic simply for now or robustly?
            // Simple: each gets share.
            // Robust: Distribute remainder. 
            // Let's do simple 2 decimal check.
            processedSplits = splits.map(s => ({
                user: s.userId,
                owed: Number(share.toFixed(2))
            }));
            // Adjust last one for rounding diff?
            const currentSum = processedSplits.reduce((acc, s) => acc + s.owed, 0);
            const diff = amount - currentSum;
            if (diff !== 0) {
                processedSplits[0].owed += diff;
                processedSplits[0].owed = Number(processedSplits[0].owed.toFixed(2));
            }

        } else if (splitType === 'EXACT') {
            processedSplits = splits.map(s => ({
                user: s.userId,
                amount: s.amount,
                owed: s.amount
            }));
            const sum = processedSplits.reduce((acc, s) => acc + s.amount, 0);
            if (Math.abs(sum - amount) > 0.01) {
                return res.status(400).json({ msg: 'Split amounts do not match total' });
            }

        } else if (splitType === 'PERCENT') {
            processedSplits = splits.map(s => ({
                user: s.userId,
                percentage: s.percentage,
                owed: Number(((s.percentage / 100) * amount).toFixed(2))
            }));
            // Check 100%?
            const totalPercent = splits.reduce((acc, s) => acc + s.percentage, 0);
            if (Math.abs(totalPercent - 100) > 0.01) {
                return res.status(400).json({ msg: 'Percentages do not equal 100' });
            }
            // Adjust rounding
            const currentSum = processedSplits.reduce((acc, s) => acc + s.owed, 0);
            const diff = amount - currentSum;
            if (diff !== 0) {
                processedSplits[0].owed += diff;
                processedSplits[0].owed = Number(processedSplits[0].owed.toFixed(2));
            }
        }

        const expense = new Expense({
            group: groupId,
            payer: req.user.id,
            amount,
            description,
            splitType,
            splits: processedSplits
        });

        await expense.save();
        res.json(expense);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ group: req.params.groupId })
            .populate('payer', 'name')
            .populate('splits.user', 'name')
            .sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
