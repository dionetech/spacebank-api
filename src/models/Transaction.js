const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        sender: {
            type: String,
        },
        receiver: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        receiverDescription: {
            type: String,
        },
        type: {
            type: String,
            required: true,
        },
        receiverType: {
            type: String,
        },
        icon: {
            type: String,
        },
        status: {
            type: String,
            default: 'pending',
        },
        mode: {
            type: String,
            required: true,
        },
        receiverMode: {
            type: String,
        },
        walletInfo: {
            type: Object,
        },
        extraInfo: {
            type: Object,
        },
        createdAt: {
            type: Date,
            required: true,
            default: new Date().toISOString(),
        },
    },
    { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
