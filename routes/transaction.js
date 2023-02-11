const failedResponse = require("../helpers/failedResponse");
const successResponse = require("../helpers/successResponse");
const Auth = require("../middleware/auth");
const { Balance } = require("../models/Balance");
const { User } = require("../models/User");
const router = require("express").Router();

router.post("/send-money", [Auth], async(req, res) => {
    const { username, amount, description, pin } = req.body;

    const sender = await User.findOne({ _id: req.user._id });
    if (String(sender.transaction_password)!==String(pin)) return failedResponse(res, 400, "Incorrect transaction pin");

    const recepient = await User.findOne({ username: username });

    if (!recepient) return failedResponse(res, 400, 'User with that username not found');
    if (recepient._id===sender._id) return failedResponse(res, 400, "Can't send money to yourself");

    const senderBalance = await Balance.findOne({ user: sender._id });
    const recepientBalance = await Balance.findOne({ user: recepient._id });

    senderBalance.balance = parseInt(senderBalance.balance) - parseInt(amount);
    recepientBalance.balance = parseInt(recepientBalance.balance) + parseInt(amount);

    await senderBalance.save();
    await recepientBalance.save();
    
    return successResponse(res, 200, {}, `You sent ${amount} to ${username}`);
});

module.exports = router;