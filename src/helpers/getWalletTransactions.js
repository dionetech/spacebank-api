const Transaction = require("../models/Transaction");
const axios = require("axios");

module.exports = async function (walletAddress) {
    const response = await axios.get(`https://api-testnet.bscscan.com/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=4QUMBWF3BHP3JS7I9T5W91USMMVRZEM9A8`);
    return response.data.result;
};