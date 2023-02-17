const express = require('express');
const router = express.Router();
const failedResponse = require("../helpers/failedResponse");
const successResponse = require('../helpers/successResponse');
const Auth = require("../middleware/auth");
const { Balance } = require("../models/Balance");
const { Deposit } = require("../models/Deposit");
const { Transaction } = require('../models/Transaction');
const { User } = require("../models/User");
const { Withdrawal } = require("../models/Withdrawal");


// Get a user's details based on Id
router.get('/:id', [Auth], async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return failedResponse(res, 400, 'User data error');

    const transactions = await Transaction.find({ user: id }).sort({ createdAt: -1 });
    const balances = await Balance.findOne({ user: id });
    const deposits = await Deposit.find({ user: id });
    const withdrawals = await Withdrawal.find({ user: id });

    return successResponse(
        res,
        200,
        {
            user,
            transactions,
            balances,
            deposits,
            withdrawals,
        },
        'Complete User Details'
    );
});

router.put("/:id", [Auth], async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return failedResponse(req, 400, 'User data error');
})

router.post("/verify-identity", [Auth], async(req, res) => {
    const id = req.user._id;
    const { firstName, lastName, username, gender, pin } = req.body;

    const user = await User.findById(id);
    if (!user) return failedResponse(res, 400, 'User data error');

    const verification = await Verification.findOne({ user: id });
    const checkUsername = await User.findOne({ username: username });
    if (checkUsername) return failedResponse(res, 400, 'Username not available')

    user.username = username;
    user.transaction_password = pin;
    user.verified_identity = true;
    verification.details.first_name = firstName;
    verification.details.last_name = lastName;
    verification.details.gender = gender;

    await user.save();
    await verification.save();

    return successResponse(
        res,
        200,
        {
            user,
            verification
        },
        'User verification successful'
    );
})

module.exports = router;