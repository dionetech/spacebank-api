const { TransactionNotificationEmail } = require("./mailer");
const Transaction = require("../models/Transaction");

export const addNewTransaction = async (data) => {
    const transaction = new Transaction({
        sender: data.fromAddress,
        amount: parseInt(data.amount),
        description: data.description,
        type: data.type,
        status: "confirmed",
        icon: data.icon,
        createdAt: new Date().toISOString(),
        mode: data.mode,
        walletInfo: {
            fromAddress: data.fromAddress,
            toAddress: data.toAddress,
            privateKey: data.privateKey,
            icon: data.icon,
        },
        extraInfo: data.extraInfo
    })
    await TransactionNotificationEmail(data.user.email, transaction);
    await transaction.save();
}