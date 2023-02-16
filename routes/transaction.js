const failedResponse = require("../helpers/failedResponse");
const successResponse = require("../helpers/successResponse");
const Auth = require("../middleware/auth");
const { Balance } = require("../models/Balance");
const { User } = require("../models/User");
const axios = require("axios");
const router = require("express").Router();

router.post("/send-money/p2p", [Auth], async(req, res) => {
    const { username, amount, description, pin } = req.body;

    console.log("PIN: ", pin);

    const sender = await User.findOne({ _id: req.user._id });
    if (String(sender.transactionPassword)!==String(pin)) return failedResponse(res, 400, "Incorrect transaction pin");

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

router.post("/buy-airtime", [Auth], async (req, res) => {
    const {phone, network, amount} = req.body;

    console.log("BODY: ", req.body);

    var data = JSON.stringify({
        "phone": String(phone),
        "amount": parseInt(amount),
        "network": parseInt(network)
    });
      
    var config = {
        method: 'POST',
        url: 'https://bingpay.ng/api/v1/buy-airtime',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': 'Bearer 1dd501141dffd9d68f254b241f05871b8f10754c90f4832ad9'
        },
        data : data
    };
      
    axios(config)
        .then(function (response) {
            if (response.data.error){
                return failedResponse(res, 400, response.data.message);
            }
            return successResponse(res, 200, response.data, `You recharged ₦${amount} to ${phone}`);
        })
        .catch(function (error) {
            console.log("ERROR: ", error);
            return failedResponse(res, 400, 'Insufficient balance');
        });
})

module.exports = router;