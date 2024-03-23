const User = require("../models/User");

function CreditUpdate (id, currency, amount) {
    User.findOneAndUpdate(
        { _id: user._id, 'balance.currency': currency },
        { $inc: { 'balance.$.value': parseInt(amount) } },
        { new: true }   //returns the updated document
    )
};

function DebitUpdate (id, currency, amount) {
    User.findOneAndUpdate(
        { _id: user._id, 'balance.currency': currency },
        { $inc: { 'balance.$.value': -(parseInt(amount)) } },
        { new: true }   //returns the updated document
    )
};

module.exports = { CreditUpdate, DebitUpdate }