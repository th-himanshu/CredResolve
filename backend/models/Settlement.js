const mongoose = require('mongoose');

const SettlementSchema = new mongoose.Schema({
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settlement', SettlementSchema);
