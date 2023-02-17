const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
        },
        status: {
            type: String,
            default: 'Pending',
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

module.exports = { Transaction };
