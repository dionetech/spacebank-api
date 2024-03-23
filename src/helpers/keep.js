const { User } = require('../models/User');
const Transaction = require("../models/Transaction");
const axios = require("axios");
const Web3Utils = require('web3-utils');

const checkWalletAddress = (trAddress, walletAddresses) => {
    let exist = walletAddresses.includes(trAddress);
    return exist;
}

const checkTransactionHash = (trHash, trHashes) => {
    let exist = trHashes.includes(trHash);
    return exist;
}

const getNetworkIcon = (contractAddress) => {
    if (contractAddress===""){
        return "bnb";
    }
    if (contractAddress==="0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"){
        return "wbnb"
    }
    if (contractAddress==="0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"){
        return "usdt";
    }
    if (contractAddress==="0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee"){
        return "busd";
    }
}

const getNetworkTransactions = async () => {
    let allUsers = await User.find();
    let nativeTransactions = await Transaction.find();
    let walletAddresses = [];
    let trHashes = [];

    allUsers.map((user) => {
        walletAddresses.push(String(user.wallet.address).toLowerCase());
    })
    nativeTransactions.map((tr) => {
        trHashes.push(tr.extraInfo.trData.hash?tr.extraInfo.trData.hash:tr.extraInfo.trData.transactionHash);
    })

    allUsers.map(async (user) => {
        const response = await axios.get(`https://api.bscscan.com/api?module=account&action=tokentx&address=${user.wallet.address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=4QUMBWF3BHP3JS7I9T5W91USMMVRZEM9A8`);
        let userTransactions = response.data.result;

        userTransactions.map(async (usTr) => {
            const checkFromAddress = checkWalletAddress(String(usTr.from).toLowerCase(), walletAddresses);
            if (!checkFromAddress){
                const checkTrHash = checkTransactionHash(usTr.hash, trHashes);
                if (!checkTrHash){
                    let ethValue = Web3Utils.fromWei(usTr.value);
                    let networkIcon = getNetworkIcon(usTr.contractAddress);
                    console.log("USTR: ", usTr);
                    let extraInfo = {
                        blockNumber: usTr.blockNumber,
                        hash: usTr.hash,
                        nonce: usTr.nonce,
                        blockHash: usTr.blockHash,
                        transactionIndex: usTr.transactionIndex,
                        from: usTr.from,
                        to: usTr.to,
                        value: ethValue,
                        gas: usTr.gas,
                        gasPrice: usTr.gasPrice,
                        isError: usTr.isError,
                        txreceipt_status: usTr.txreceipt_status,
                        input: usTr.input,
                        contractAddress: usTr.contractAddress,
                        cumulativeGasUsed: usTr.cumulativeGasUsed,
                        gasUsed: usTr.gasUsed,
                        confirmations: usTr.confirmations,
                        methodId: usTr.methodId,
                        functionName: usTr.functionName,
                        gottenFromWallet: true,
                    };
                    const transaction = new Transaction({
                        sender: usTr.from,
                        receiver: usTr.to,
                        amount: ethValue,
                        description: `You sent ${networkIcon} to ${String(usTr.to).slice(0, 20)}...`,
                        receiverDescription: `You received ${networkIcon} from ${String(usTr.from).slice(0, 18)}...`,
                        type: `sent-${networkIcon}`,
                        receiverType: `received-${networkIcon}`,
                        status: "confirmed",
                        icon: networkIcon,
                        mode: "outgoing",
                        receiverMode: "incoming",
                        walletInfo: {
                            fromAddress: usTr.from,
                            toAddress: usTr.to,
                            privateKey: user.wallet.privateKey,
                            networkIcon,
                        },
                        extraInfo: {
                            trData: extraInfo
                        },
                        createdAt: new Date().toISOString()
                    })
                    // await transaction.save();
                }
            }
        })
    })
}

module.exports = { getNetworkTransactions }