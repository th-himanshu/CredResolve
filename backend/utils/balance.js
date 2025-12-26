const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

async function calculateBalances(groupId) {
    const expenses = await Expense.find({ group: groupId });
    const settlements = await Settlement.find({ group: groupId });

    const balances = {}; // { userId: netAmount }

    // Process Expenses
    expenses.forEach(expense => {
        const payerId = expense.payer.toString();
        if (!balances[payerId]) balances[payerId] = 0;
        balances[payerId] += expense.amount; // Payer gets credit

        expense.splits.forEach(split => {
            const userId = split.user.toString();
            if (!balances[userId]) balances[userId] = 0;
            // Subtract what they owe
            if (expense.splitType === 'EQUAL') {
                // Recalculate strictly or trust stored owed amount? 
                // We should trust the stored 'owed' if we saved it correctly. 
                // But my data model for Expense has 'owed' field.
                // Let's rely on that.
                balances[userId] -= (split.owed || 0);
            } else if (expense.splitType === 'EXACT') {
                balances[userId] -= (split.amount || 0);
            } else if (expense.splitType === 'PERCENT') {
                // Logic should save the calculated amount in 'owed' or 'amount'
                // My model has 'owed'.
                balances[userId] -= (split.owed || 0);
            }
        });
    });

    // Process Settlements
    settlements.forEach(settlement => {
        const payerId = settlement.payer.toString();
        const payeeId = settlement.payee.toString();

        if (!balances[payerId]) balances[payerId] = 0;
        if (!balances[payeeId]) balances[payeeId] = 0;

        balances[payerId] += settlement.amount; // Payer reduces debt (or increases credit)
        balances[payeeId] -= settlement.amount; // Payee reduces credit (or increases debt)
    });

    return balances;
}

function simplifyDebts(balances) {
    const debtors = [];
    const creditors = [];

    // Separate into two lists
    for (const [userId, amount] of Object.entries(balances)) {
        if (amount < -0.01) debtors.push({ userId, amount }); // Negative
        if (amount > 0.01) creditors.push({ userId, amount }); // Positive
    }

    // Sort to be deterministic (optional but good)
    debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

    const settlements = [];
    let i = 0; // debtors index
    let j = 0; // creditors index

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        // The amount to settle is the minimum of absolute debt and credit
        let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
        amount = Math.round(amount * 100) / 100; // Round to 2 decimals

        if (amount > 0) {
            settlements.push({
                from: debtor.userId,
                to: creditor.userId,
                amount: amount
            });
        }

        // Adjust remaining balances
        debtor.amount += amount;
        creditor.amount -= amount;

        // If settled, move to next
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return settlements;
}

module.exports = { calculateBalances, simplifyDebts };
