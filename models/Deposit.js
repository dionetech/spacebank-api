const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema(
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
        to: {
            type: String,
            trim: true,
        },
        receipt: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: 'Pending',
        },
        comment: {
            type: String,
            default: 'No Comment',
        },
        proof: {
            type: String,
            default: "False"
        }
    },
    { timestamps: true }
);

const Deposit = mongoose.model('Deposit', depositSchema);

module.exports = { Deposit };
