const failedResponse = require("../../helpers/failedResponse");
const successResponse = require("../../helpers/successResponse");
const Auth = require("../../middleware/auth");
const { User } = require("../../models/User");
const axios = require("axios");
const { Transaction } = require("../../models/Transaction");
const { TransactionNotificationEmail } = require("../../helpers/mailer");
const router = require("express").Router();

router.get("/:id", [Auth], async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return failedResponse(res, 400, 'User not found');
    console.log("USER: ", user);
})

router.post("/airtime/buy-airtime", [Auth], async (req, res) => {
    const { extraInfo, fromAddress, toAddress, privateKey, phone, network, amount, networkIcon} = req.body;
    const user = await User.findById(req.user._id);

    var data = JSON.stringify({
        "phone": String(phone),
        "amount": parseInt(amount)-650,
        "network": parseInt(network)
    });
      
    var config = {
        method: 'POST',
        url: 'https://bingpay.ng/api/v1/buy-airtime',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${process.env.BINGPAY_API_KEY}`
        },
        data : data
    };
      
    axios(config)
        .then(async function (response) {
            const transaction = new Transaction({
                sender: fromAddress,
                amount: parseInt(amount),
                description: `Recharged to ${phone}`,
                type: "buy-airtime",
                status: "confirmed",
                icon: networkIcon,
                createdAt: new Date().toISOString(),
                mode: "outgoing",
                walletInfo: {
                    fromAddress,
                    toAddress,
                    privateKey,
                    networkIcon,
                },
                extraInfo: extraInfo
            })
            await TransactionNotificationEmail(user.email, transaction);
            await transaction.save();
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
            'Authorization': `Bearer ${process.env.BINGPAY_API_KEY}`
        },
        data : data
    };
      
    axios(config)
        .then(async function (response) {
            const transaction = new Transaction({
                user: user,
                amount: parseInt(amount),
                description: `Subscribed to ${phone}`,
                type: "buy-data",
                status: "confirmed",
                icon: networkIcon,
                createdAt: new Date().toISOString(),
                mode: "outgoing"
            })
            await transaction.save();
            if (response.data.error){
                console.log("ERROR 2: ", response.data);
                return failedResponse(res, 400, response.data.message);
            }
            await TransactionNotificationEmail(user.email, transaction);
            return successResponse(res, 200, response.data, `You subscribed ₦${amount} to ${phone}`);
        })
        .catch(function (error) {
            console.log(error);
            return failedResponse(res, 400, "An error occured");
        });
}})

router.post("/bill/pay-bill", [Auth], async (req, res) => {
    const { service_id, customer_id, variation_code, amount, networkIcon } = req.body;
    const user = await User.findById(req.user._id);

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
            'Authorization': `Bearer ${process.env.BINGPAY_API_KEY}`
        },
        data : data
    };

    axios(config)
        .then(async function (response) {
            const transaction = new Transaction({
                sender: user.wallet.address,
                amount: parseInt(amount),
                description: `Paid a bill`,
                type: "pay-bill",
                status: "confirmed",
                icon: networkIcon,
                mode: "outgoing",
                createdAt: new Date().toISOString()
            })
            await transaction.save();
            if (response.data.error){
                console.log("ERROR 2: ", response.data);
                return failedResponse(res, 400, response.data.message);
            }
            await TransactionNotificationEmail(user.email, transaction);
            return successResponse(res, 200, response.data, `Paid a bill of ₦${amount}`);
        })
        .catch(function (error) {
            console.log("ERROR: ", error);
            return failedResponse(res, 400, "An error occured");
        });
})

router.post("/crypto/send", [Auth], async (req, res) => {
    const  { fromAddress, toAddress, amount, privateKey, networkIcon, extraInfo } = req.body;
    const user = await User.findById(req.user._id);

    const transaction = new Transaction({
        sender: fromAddress,
        receiver: toAddress,
        amount: parseFloat(amount),
        description: `You sent ${networkIcon} to ${String(toAddress).slice(0, 20)}...`,
        receiverDescription: `You received ${networkIcon} from ${user.username}`,
        type: `sent-${networkIcon}`,
        receiverType: `received-${networkIcon}`,
        status: "confirmed",
        icon: networkIcon,
        mode: "outgoing",
        receiverMode: "incoming",
        walletInfo: {
            fromAddress,
            toAddress,
            privateKey,
            networkIcon,
        },
        extraInfo: extraInfo,
        createdAt: new Date().toISOString()
    })
    await transaction.save();
    await TransactionNotificationEmail(user.email, transaction);
    return successResponse(res, 200, { transaction }, `You sent ${networkIcon} to ${String(toAddress).slice(0, 10)}...`);
});

router.post("/send-money/p2p", [Auth], async(req, res) => {
    const  { fromAddress, toAddress, amount, privateKey, networkIcon, username, extraInfo } = req.body;
    const user = await User.findById(req.user._id);
    const recepient = await User.findOne({ username: username });

    if (!recepient) return failedResponse(res, 400, 'User with that username not found');

    if (recepient.username===user.username) return failedResponse(res, 400, "Can't send money to yourself");

    const transaction = new Transaction({
        sender: fromAddress,
        receiver: toAddress,
        amount: parseFloat(amount),
        description: `You sent ${networkIcon} to ${recepient.username}`,
        receiverDescription: `You received ${networkIcon} from ${user.username}`,
        type: `sent-${networkIcon}`,
        receiverType: `received-${networkIcon}`,
        status: "confirmed",
        icon: networkIcon,
        mode: "outgoing",
        receiverMode: "incoming",
        walletInfo: {
            fromAddress,
            toAddress,
            privateKey,
            networkIcon,
        },
        extraInfo: extraInfo,
        createdAt: new Date().toISOString()
    })
    await TransactionNotificationEmail(user.email, transaction);
    await transaction.save();
    return successResponse(res, 200, {}, `You sent ${amount} to ${username}`);
});

router.post("/giftcard/purchase", [Auth], async (req, res) => {
    console.log("BODY: ", req.body);
    const { product_id, amount, networkIcon, name } = req.body;
    const user = await User.findById(req.user._id);

    var data = JSON.stringify({
        "product_id": product_id
    });
    
    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://bingpay.ng/api/v1/validate-local-giftcard',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${process.env.BINGPAY_API_KEY}`
        },
        data : data
    };
    
    axios(config)
        .then(function (response) {
            // console.log("RESP: ", response.data);
            if (response.data.error===false){
                data = JSON.stringify({
                    "product_id": product_id,
                    "amount": parseInt(amount)
                });

                config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'https://bingpay.ng/api/v1/purchase-local-giftcard',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${process.env.BINGPAY_API_KEY}`
                    },
                    data : data
                };

                axios(config)
                    .then(async function (response) {
                        // console.log("RESP2 : ", response.data);
                        if (response.data.error===false){
                            // Move success function here...
                        }
                        const transaction = new Transaction({
                            sender: user.wallet.address,
                            amount: parseInt(amount),
                            description: `Purchased a ${name} gift card`,
                            type: "purchased-giftcard",
                            status: "confirmed",
                            icon: networkIcon,
                            createdAt: new Date().toISOString(),
                            mode: "outgoing"
                        })
                        await TransactionNotificationEmail(user.email, transaction);
                        await transaction.save();
                        return successResponse(res, 200, response.data, `Purchased a ${name} gift card`);
                    })
                    .catch(function (error) {
                        console.log("ERROR 2: ", error);
                        return failedResponse(res, 400, "An error occured");
                    });
            }
        })
        .catch(function (error) {
            console.log("ERROR: ", error);
            return failedResponse(res, 400, "An error occured");
        });
})

router.post("/giftcard/international/purchase", [Auth], async (req, res) => {
    console.log("BODY: ", req.body);
    const { product_id, country, sender, amount, networkIcon, name } = req.body;
    const user = await User.findById(req.user._id);

    var data = JSON.stringify({
        "product_id": product_id
    });
    
    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://bingpay.ng/api/v1/validate-local-giftcard',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${process.env.BINGPAY_API_KEY}`
        },
        data : data
    };
    
    axios(config)
        .then(function (response) {
            if (response.data.error===false){
                data = JSON.stringify({
                    "product_id": product_id,
                    "amount": parseInt(amount),
                    "country": country,
                    "phone": "07061785183",
                    "sender": "Spacebank Technologies",
                });

                config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'https://bingpay.ng/api/v1/purchase-giftcard',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${process.env.BINGPAY_API_KEY}`
                    },
                    data : data
                };

                axios(config)
                    .then(async function (response) {
                        // console.log("RESP2 : ", response.data);
                        if (response.data.error===false){
                            // Move success function here...
                        }
                        const transaction = new Transaction({
                            sender: user.wallet.address,
                            amount: parseInt(amount),
                            description: `Purchased a ${name} gift card`,
                            type: "purchased-giftcard",
                            status: "confirmed",
                            icon: networkIcon,
                            createdAt: new Date().toISOString(),
                            mode: "outgoing"
                        })
                        await TransactionNotificationEmail(user.email, transaction);
                        await transaction.save();
                        return successResponse(res, 200, response.data, `Purchased a ${name} gift card`);
                    })
                    .catch(function (error) {
                        console.log("ERROR 2: ", error);
                        return failedResponse(res, 400, "An error occured");
                    });
            }
        })
        .catch(function (error) {
            console.log("ERROR: ", error);
            return failedResponse(res, 400, "An error occured");
        });
})

module.exports = router;