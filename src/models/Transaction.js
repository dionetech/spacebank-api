const mongoose = require("mongoose");
const User = require("./User");

const transactionSchema = new mongoose.Schema(
    {
        
        senderId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
        },
        receiverId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
        },
        referenceCode: {
            type: String,
        },
        type: {
            method: String,
            product: String
        },
        amount: [{ 
            currency: String,
            value: Number
        }],
        sender: {
            type: String,
        },
        receiver: {
            type: String,
        },
        pricePerCoin: {
            type: Number,
        },
        productId: {
            type: String,
        },
        status: {
            type: String,
        },
        total: {
            type: Number,
        },
        subTotal: {
            type: Number,
        },
        paymentMethod: {
            type: String,
        },
        fee: {
            type: Number,
        },
        country: {
            type: String,
        },
        description: {
            type: String,
        },
        receiverDescription: {
            type: String,
        },
        status: {
            type: String,
            default: 'Submitted',
        },
        icon: {
            type: String,
        },
        createdAt: {
            type: Date,
            required: true,
            default: new Date().toISOString(),
        },
        walletInfo: {
            type: Object,
        },
        transactionInfo: {
            type: Object,
        },
        extraInfo: {
            type: Object,
        },
    },
    { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;



/* DESCRIPTION OF SCHEMA
type: method - sent, receive, swap, boughtairtime, boughtgiftcard, boughtdata,
      product - MTN 500MB plan, Amazon $20, Tremendous $5 Visa card, BTC, USDT, ..
amount: currency - Dolaar, Naira, BTC, USDT, ...
        value - 30, 2, 0.3, ...
status: completed, submitted, failed.

transactionInfo: an object to hold some specific transaction information that is not commmon to all other transaction
*/