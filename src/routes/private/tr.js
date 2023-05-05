const failedResponse = require("../../helpers/failedResponse");
const successResponse = require("../../helpers/successResponse");
const Auth = require("../../middleware/auth");
const { User } = require("../../models/User");
const axios = require("axios");
const { Transaction } = require("../../models/Transaction");
const { TransactionNotificationEmail } = require("../../helpers/mailer");
const { addNewTransaction } = require("../../helpers/addNewTransaction");
const router = require("express").Router();

router.get("/:id", [Auth], async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return failedResponse(res, 400, 'User not found');
    console.log("USER: ", user);
})

router.post("/airtime/buy-airtime", [Auth], async (req, res) => {
    const {
        extraInfo,
        fromAddress,
        toAddress,
        privateKey,
        phone,
        network,
        amount,
        networkIcon
    } = req.body;
    const user = await User.findById(req.user._id);

    axios({
        method: 'POST',
        url: 'https://bingpay.ng/api/v1/buy-airtime',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${process.env.BINGPAY_API_KEY}`
        },
        data : {
            phone: String(phone),
            amount: parseInt(amount)-650,
            network: parseInt(network)
        }
    })
    .then(async function (response) {
        if (response.data.error){
            console.log("RSPONSE ERROR: ", response.data);
            return failedResponse(res, 400, response.data.message);
        }
        const transactionData = {
            fromAddress,
            toAddress,
            amount,
            description: `Recharged to ${phone}`,
            type: "buy-airtime",
            icon: networkIcon,
            mode: "outgoing"
        }
        await addNewTransaction(transactionData);
        return successResponse(res, 200, response.data, `You recharged ₦${amount} to ${phone}`);
    })
    .catch(function (error) {
        console.log("AIRTIME ERROR: ", error.response);
        return failedResponse(res, 400, 'An error occured');
    });
})

module.exports = router;