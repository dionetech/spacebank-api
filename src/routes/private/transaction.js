const failedResponse = require("../../helpers/failedResponse");
const successResponse = require("../../helpers/successResponse");
const Auth = require("../../middleware/auth");
const { User } = require("../../models/User");
const axios = require("axios");
const Transaction = require("../../models/Transaction");
const { TransactionNotificationEmail } = require("../../helpers/mailer");
const router = require("express").Router();
const { DebitUpdate, CreditUpdate } = require("../../helpers/updateBalance")

router.get("/:id", [Auth], async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return failedResponse(res, 400, 'User not found');
    console.log("USER: ", user);
})

router.post("/airtime/buy-airtime", [Auth], async (req, res) => {
    const { extraInfo, fromAddress, toAddress, privateKey, phone, network, amount, networkIcon, currency } = req.body;
    const user = await User.findById(req.user._id);
    let product = "";

    if (network === 1) { product = "MTN-Airtime"}
    else if (network === 2) { product = "Aitel Airtime"}
    else if (network === 3) { product = "9 Mobile Airtime"}
    else if (network === 4) { product = "GLO AIrtime"}

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
            var fee = 0.2;
            var subtotal = 0.8;
            var total = fee + subtotal;
            var pricePerCoin = parseInt(amount)/parseInt(amount);
            const transaction = new Transaction({
                userId: req.user._id,
                type: {
                    product: product,
                    method: "Bought Airtime",
                },
                amount: [{
                    currency: currency,
                    value: parseInt(amount),
                }],
                sender: fromAddress,
                receiver: toAddress,
                pricePerCoin: pricePerCoin,
                description: `Recharged ${product} to ${phone}`,
                fee: fee,
                total: total,
                subtotal: subtotal,
                status: "completed",
                createdAt: new Date().toISOString(),
                transactionInfo: {
                    network: network,
                    phone: phone,
                },
                walletInfo: {
                    fromAddress,
                    toAddress,
                    privateKey,
                    networkIcon,
                },
                extraInfo: extraInfo,
            })
            await TransactionNotificationEmail(user.email, `Successfully recharged â¦${transaction.amount} to ${phone}`);
            await transaction.save();
            if (response.data.error) {
                console.log("ERROR 2: ", response.data);
                return failedResponse(res, 400, response.data.message);
            }
            return successResponse(res, 200, response.data, `You recharged â¦${amount} to ${phone}`);
        })
        .catch(function (error) {
            console.log("ERROR 1: ", error.response);
            return failedResponse(res, 400, 'Insufficient balance');
        });
})


router.post("/data/buy-data", [Auth], async (req, res)  => {{
    const {extraInfo, fromAddress, toAddress, privateKey, plan, network, phone, amount, networkIcon} = req.body;
    const user = await User.findById(req.user._id);
    let product = "";
    
    if (network === 1) { product = "MTN-Airtime"}
    else if (network === 2) { product = "Aitel Airtime"}
    else if (network === 3) { product = "9 Mobile Airtime"}
    else if (network === 4) { product = "GLO AIrtime"}

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
            var fee = 0.2;
            var subtotal = 0.8;
            var total = fee + subtotal;
            var pricePerCoin = parseInt(amount)/parseInt(amount);

            const transaction = new Transaction({
                userId: req.user._id,
                type: {
                    product: product,
                    method: "Bought Data",
                },
                amount: [{
                    currency: networkIcon,
                    value: parseInt(amount),
                }],
                sender: fromAddress,
                receiver: toAddress,
                pricePerCoin: pricePerCoin,
                description: `Subscribed ${product} to ${phone}`,
                fee: fee,
                total: total,
                subtotal: subtotal,
                status: "completed",
                createdAt: new Date().toISOString(),
                transactionInfo: {
                    network: network,
                    phone: phone,
                },
                walletInfo: {
                    fromAddress,
                    toAddress,
                    privateKey,
                    networkIcon,
                },
                extraInfo: extraInfo,
            })
            await transaction.save();
            if (response.data.error){
                console.log("ERROR 2: ", response.data);
                return failedResponse(res, 400, response.data.message);
            }
            await TransactionNotificationEmail(user.email, `Successfully subscribed â¦${amount} to ${phone}`);
            return successResponse(res, 200, response.data, `You subscribed â¦${amount} to ${phone}`);
        })
        .catch(function (error) {
            console.log(error);
            return failedResponse(res, 400, "An error occured");
        });
}})

router.post("/bill/pay-bill", [Auth], async (req, res) => {
    const { extraInfo, fromAddress, toAddress, privateKey, service_id, customer_id, variation_code, amount, networkIcon } = req.body;
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
        .then (async function (response) {
            var fee = 0.2;
            var subtotal = 0.8;
            var total = fee + subtotal;
            var pricePerCoin = parseInt(amount)/parseInt(amount);
            const transaction = new Transaction({
                senderId: req.user._id,
                type: {
                    product: data.service_id,
                    method: "Paid Bill",
                },
                amount: [{
                    currency: networkIcon,
                    value: parseInt(amount),
                }],
                sender: fromAddress,
                receiver: toAddress,
                pricePerCoin: pricePerCoin,
                description: `Paid bill ${data.service_id}`,
                fee: fee,
                total: total,
                subtotal: subtotal,
                status: "completed",
                createdAt: new Date().toISOString(),
                transactionInfo: {
                    serviceId: data.service_id,
                    customerId: data.customer_id,
                    variation: data.variation,
                },
                walletInfo: {
                    fromAddress,
                    toAddress,
                    privateKey,
                    networkIcon,
                },
                extraInfo: extraInfo,
            });
    await transaction.save();
    if (response.data.error){
        console.log("ERROR 2: ", response.data);
        return failedResponse(res, 400, response.data.message);
    }
    await TransactionNotificationEmail(user.email, "Successfully paid a bill");
        return successResponse(res, 200, response.data, `Paid a bill of â¦${amount}`);
    })
    .catch(function (error) {
        console.log("ERROR: ", error);
        return failedResponse(res, 400, "An error occured");
    });
})

router.post("/crypto/send", [Auth], async (req, res) => {
    const  { fromAddress, toAddress, amount, privateKey, networkIcon, extraInfo } = req.body;
    const user = await User.findById(req.user._id);
    const recepient = await User.findOne({ address: toAddress });
    var fee = 0.2;
    var subtotal = 0.8;
    var total = fee + subtotal;
    var pricePerCoin = parseInt(amount)/parseInt(amount);



    const transaction = new Transaction({
        senderId: req.user._id,
        receiverId: recepient.username,
        type: {
            product: networkIcon,
            method: "Sent",
        },
        amount: [{
            currency: networkIcon,
            value: parseInt(amount),
        }],
        sender: fromAddress,
        receiver: toAddress,
        pricePerCoin: pricePerCoin,
        description: `You sent ${networkIcon} to ${String(toAddress).slice(0, 20)}...`,
        receiverDescription: `You received ${networkIcon} from ${user.username}`,
        fee: fee,
        total: total,
        subtotal: subtotal,
        status: "completed",
        createdAt: new Date().toISOString(),
        walletInfo: {
            fromAddress,
            toAddress,
            privateKey,
            networkIcon,
        },
        extraInfo: extraInfo,
    })
    await transaction.save();
    await TransactionNotificationEmail(user.email, `You successfully sent ${parseFloat(amount)}USD in ${networkIcon} to ${String(toAddress)}`);
    return successResponse(res, 200, { transaction }, `You sent ${networkIcon} to ${String(toAddress).slice(0, 10)}...`);
});

router.post("/send-money/p2p", [Auth], async(req, res) => {
    const  { fromAddress, toAddress, amount, privateKey, networkIcon, username, extraInfo } = req.body;
    const user = await User.findById(req.user._id);
    const recepient = await User.findOne({ username: username });
    var fee = 0.2;
    var subtotal = 0.8;
    var total = fee + subtotal;
    var pricePerCoin = parseInt(amount)/parseInt(amount);
    const currency = networkIcon;
    let transaferSuccess = false;

    if (!recepient) return failedResponse(res, 400, 'User with that username not found');

    if (recepient.username===user.username) return failedResponse(res, 400, "Can't send money to yourself");

    //program to update uerStatus data for both user, add the stated amount to receiver and remove the stated amount from sender
    User.findOneAndUpdate(
        { _id: user._id, 'balance.currency': currency },
        { $inc: { 'balance.$.value': parseInt(amount) } },
        { new: true }   //returns the updated document
    )
    .then((updatedUser1) => {
        if (updatedUser1) {
            User.findOneAndUpdate(
                { _id: user._id, 'balance.currency': currency },
                { $inc: { 'balance.$.value': parseInt(amount) } },
                { new: true }   //returns the updated document
            )
            .then((updatedUser2) => {
                if (updatedUser2) {
                    transaferSuccess = true;
                }
            })
            .catch(error => {
                DebitUpdate(user._id, currency, amount);
                return failedResponse(res, 400, 'User with that username not found');
            })
        }
    })
    .catch(error => {
        return failedResponse(res, 400, 'User with that username not found');
    });

    if (transaferSuccess === true) {
    const transaction = new Transaction({
        senderId: req.user._id,
        receiverId: recepient._id,
        type: {
            product: networkIcon,
            method: "Sent",
        },
        amount: [{
            currency: networkIcon,
            value: parseInt(amount),
        }],
        sender: fromAddress,
        receiver: toAddress,
        description: `You sent ${networkIcon} to ${recepient.username}`,
        receiverDescription: `You received ${networkIcon} from ${user.username}`,
        fee: fee,
        total: total,
        subtotal: subtotal,
        status: "completed",
        createdAt: new Date().toISOString(),
        walletInfo: {
            fromAddress,
            toAddress,
            privateKey,
            networkIcon,
        },
        extraInfo: extraInfo,
    })
    await TransactionNotificationEmail(user.email, `You successfully sent ${parseFloat(amount)}USD in ${networkIcon} to ${recepient.username}`);
    await TransactionNotificationEmail(recepient.email, `You received ${parseFloat(amount)}USD in ${networkIcon} from ${user.username}`);
    await transaction.save();
    }
    return successResponse(res, 200, {}, `You sent ${amount} to ${username}`);
});

router.post("/giftcard/purchase", [Auth], async (req, res) => {
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
            if (response.data.error===false) {
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
                            var fee = 0.2;
                            var subtotal = 0.8;
                            var total = fee + subtotal;
                            var pricePerCoin = parseInt(amount)/parseInt(amount);

                            const transaction = new Transaction({
                                senderId: req.user._id,
                                type: {
                                    product: networkIcon,
                                    method: "Purchased Giftcard",
                                },
                                amount: [{
                                    currency: networkIcon,
                                    value: parseInt(amount),
                                }],
                                sender: user.wallet.address,
                                description: `Purchased a ${name} gift card`,
                                fee: fee,
                                total: total,
                                subtotal: subtotal,
                                status: "completed",
                                createdAt: new Date().toISOString(),
                                extraInfo: extraInfo,
                            })
                            await TransactionNotificationEmail(user.email, transaction.description);
                            await transaction.save();
                            return successResponse(res, 200, response.data, `Purchased a ${name} gift card`);
                        }
                        else {
                            return failedResponse(res, 400, "An error occured");
                        }
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
                        if (response.data.error === false) {
                            var fee = 0.2;
                            var subtotal = 0.8;
                            var total = fee + subtotal;
                            var pricePerCoin = parseInt(amount)/parseInt(amount);

                            const transaction = new Transaction({
                                senderId: req.user._id,
                                type: {
                                    product: networkIcon,
                                    method: "Purchased Giftcard",
                                },
                                amount: [{
                                    currency: networkIcon,
                                    value: parseInt(amount),
                                }],
                                sender: user.wallet.address,
                                description: `Purchased a ${name} gift card`,
                                fee: fee,
                                total: total,
                                subtotal: subtotal,
                                status: "completed",
                                createdAt: new Date().toISOString(),
                                extraInfo: extraInfo,
                            });
                            await TransactionNotificationEmail(user.email, transaction.description);
                            await transaction.save();
                            return successResponse(res, 200, response.data, `Purchased a ${name} gift card`);
                        }
                        else {
                            return failedResponse(res, 400, "An error occured");
                        }
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