const failedResponse = require("../helpers/failedResponse");
const successResponse = require("../helpers/successResponse");
const Auth = require("../middleware/auth");
const { Balance } = require("../models/Balance");
const { User } = require("../models/User");
const axios = require("axios");
const { Transaction } = require("../models/Transaction");
const router = require("express").Router();

router.get("/:id", [Auth], async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return failedResponse(res, 400, 'User not found');
    console.log("USER: ", user);
})

router.post("/send-money/p2p", [Auth], async(req, res) => {
    const { username, amount, description, pin } = req.body;

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

router.post("/airtime/buy-airtime", [Auth], async (req, res) => {
    const {phone, network, amount, networkIcon} = req.body;
    const user = await User.findById(req.user._id);
    const userBalance = await Balance.findOne({ user: user });
    
    if (amount>parseInt(userBalance.balance)-1) return failedResponse(res, 400, 'Insuficient balance');

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
        .then(async function (response) {
            const transaction = new Transaction({
                user: user,
                amount: parseInt(amount),
                description: `You recharged ₦${amount} to ${phone}`,
                type: "buy-airtime",
                status: "confirmed",
                icon: networkIcon,
            })
            userBalance.balance = parseInt(userBalance.balance)-parseInt(amount);
            await transaction.save();
            userBalance.save();
            if (response.data.error){
                console.log("ERROR 2: ", response.data);
                return failedResponse(res, 400, response.data.message);
            }
            return successResponse(res, 200, response.data, `You recharged ₦${amount} to ${phone}`);
        })
        .catch(function (error) {
            console.log("ERROR 1: ", error.response);
            return failedResponse(res, 400, 'Insufficient balance');
        });
})

router.post("/data/buy-data", [Auth], async (req, res)  => {{
    const {plan, network, phone, amount, networkIcon} = req.body;
    const user = await User.findById(req.user._id);
    const userBalance = await Balance.findOne({ user: user });

    if (amount>parseInt(userBalance.balance)-1) return failedResponse(res, 400, 'Insuficient balance');

    var data = JSON.stringify({
        "phone": String(phone),
        "plan": plan,
        "network": parseInt(network),
    });
      
    var config = {
        method: 'POST',
        url: 'https://bingpay.ng/api/v1/buy-data',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': 'Bearer 1dd501141dffd9d68f254b241f05871b8f10754c90f4832ad9'
        },
        data : data
    };
      
    axios(config)
        .then(async function (response) {
            const transaction = new Transaction({
                user: user,
                amount: parseInt(amount),
                description: `You subscribed ₦${amount} to ${phone}`,
                type: "buy-data",
                status: "confirmed",
                icon: networkIcon,
            })
            userBalance.balance = parseInt(userBalance.balance)-parseInt(amount);
            await transaction.save();
            userBalance.save();
            if (response.data.error){
                console.log("ERROR 2: ", response.data);
                return failedResponse(res, 400, response.data.message);
            }
            return successResponse(res, 200, response.data, `You recharged ₦${amount} to ${phone}`);
        })
        .catch(function (error) {
            console.log(error);
            return failedResponse(res, 400, "An error occured");
        });
}})

router.post("/bill/pay-bill", [Auth], async (req, res) => {
    const { service_id, customer_id, variation_code, amount, networkIcon } = req.body;
    const user = await User.findById(req.user._id);
    const userBalance = await Balance.findOne({ user: user });

    if (amount>parseInt(userBalance.balance)-1) return failedResponse(res, 400, 'Insuficient balance');

    var data = JSON.stringify({
        "service_id": String(service_id),
        "customer_id": String(customer_id),
        "variation": String(variation_code),
        "amount": String(amount)
    });
      
    var config = {
        method: 'POST',
        url: 'https://bingpay.ng/api/v1/purchase-bill',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': 'Bearer 1dd501141dffd9d68f254b241f05871b8f10754c90f4832ad9'
        },
        data : data
    };

    axios(config)
        .then(async function (response) {
            const transaction = new Transaction({
                user: user,
                amount: parseInt(amount),
                description: `You paid a bill of ${amount}`,
                type: "pay-bill",
                status: "confirmed",
                icon: networkIcon,
            })
            userBalance.balance = parseInt(userBalance.balance)-parseInt(amount);
            await transaction.save();
            userBalance.save();
            if (response.data.error){
                console.log("ERROR 2: ", response.data);
                return failedResponse(res, 400, response.data.message);
            }
            return successResponse(res, 200, response.data, `You recharged ₦${amount} to ${phone}`);
        })
        .catch(function (error) {
            console.log(error);
            return failedResponse(res, 400, "An error occured");
        });
})

router.get("/giftcard/all", [Auth], async (req, res) => {
    
})

module.exports = router;