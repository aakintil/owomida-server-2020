const mongoose = require('mongoose'); 

const Schema = mongoose.Schema;
const TransactionSchema = new mongoose.Schema({
    amount: Number,
    commission: Number,
    date: String,
    desc: String,
    type: {
        type: String,
        enum : ['credit','debit'],
    },
    account: String, 
    totalBalance: Schema.Types.Mixed,
    availableBalance: Schema.Types.Mixed,
    googleSheetsIndex: Number,
    currency: String
});

const Transaction = mongoose.model('bank-transactions-collection', TransactionSchema, 'bank-transactions-collection');

module.exports = Transaction; 