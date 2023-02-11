const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    deposits: {
        type: mongoose.Types.Decimal128,
        default: 0.0,
    },
    balance: {
        type: mongoose.Types.Decimal128,
        default: 0.0,
    },
    profits: {
        type: mongoose.Types.Decimal128,
        default: 0.0,
    },
    withdrawals: {
        type: mongoose.Types.Decimal128,
        default: 0.0,
    },
    bonuses: {
        type: mongoose.Types.Decimal128,
        default: 0.0,
    },
  },
  { timestamps: true },
);

const Balance = mongoose.model("Balance", balanceSchema);

module.exports = { Balance };
