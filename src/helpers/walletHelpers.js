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
    const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    const usdt = "0x55d398326f99059fF775485246999027B3197955";
    const busd = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
    const usdc = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

    if (String(contractAddress).toLowerCase()===String(wbnb).toLowerCase()){
        return "wbnb"
    }
    if (String(contractAddress).toLowerCase()===String(usdt).toLowerCase()){
        return "usdt"
    }
    if (String(contractAddress).toLowerCase()===String(busd).toLowerCase()){
        return "busd"
    }
    if (String(contractAddress).toLowerCase()===String(usdc).toLowerCase()){
        return "usdc"
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

    const response = await axios.get(`https://api.bscscan.com/api?module=account&action=txlist&address=${String(walletAddresses)}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=4QUMBWF3BHP3JS7I9T5W91USMMVRZEM9A8`);
    const entireWLTr = response.data.result;

    if ((entireWLTr.length>0) && (Array.isArray(entireWLTr))) {
        entireWLTr.map(async (usTr) => {
            const checkFromAddress = checkWalletAddress(String(usTr.from).toLowerCase(), walletAddresses);
            if (!checkFromAddress){
                const checkTrHash = checkTransactionHash(usTr.hash, trHashes);
                console.log("CHECH TR HASH: ", checkTrHash);
                if (!checkTrHash){
                    let ethValue = Web3Utils.fromWei(usTr.value);
                    let networkIcon = getNetworkIcon(usTr.contractAddress);
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
                        amount: [{
                            currency: networkIcon,
                            value: ethValue
                        }],
                        description: `You sent ${networkIcon} to ${String(usTr.to).slice(0, 20)}...`,
                        receiverDescription: `You received ${networkIcon} from ${String(usTr.from).slice(0, 15)}...`,
                        type: {
                            method: "Sent",
                            product: networkIcon
                        },
                        receiverType: `received-${networkIcon}`,
                        status: "confirmed",
                        icon: networkIcon,
                        mode: "outgoing",
                        receiverMode: "incoming",
                        walletInfo: {
                            fromAddress: usTr.from,
                            toAddress: usTr.to,
                            networkIcon,
                        },
                        extraInfo: {
                            trData: extraInfo
                        },
                        createdAt: new Date().toISOString()
                    })
                    await transaction.save();
                }
            }
        })
    }

    allUsers.map(async (user) => {
        let userResponse = await axios.get(`https://api.bscscan.com/api?module=account&action=tokentx&address=${user.wallet.address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=4QUMBWF3BHP3JS7I9T5W91USMMVRZEM9A8`);
        let bep20TR = userResponse.data.result;
        
        if ((bep20TR.length>0) && (Array.isArray(bep20TR))) {
            bep20TR.map(async (usTr) => {
                const checkFromAddress = checkWalletAddress(String(usTr.from).toLowerCase(), walletAddresses);
                if (!checkFromAddress){
                    const checkTrHash = checkTransactionHash(usTr.hash, trHashes);
                    console.log("CHECH TR HASH: ", checkTrHash);
                    if (!checkTrHash){
                        let ethValue = Web3Utils.fromWei(usTr.value);
                        let networkIcon = getNetworkIcon(usTr.contractAddress);
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
                            input: usTr.input,
                            contractAddress: usTr.contractAddress,
                            cumulativeGasUsed: usTr.cumulativeGasUsed,
                            gasUsed: usTr.gasUsed,
                            confirmations: usTr.confirmations,
                            gottenFromWallet: true,
                        };
                        const transaction = new Transaction({
                            sender: usTr.from,
                            receiver: usTr.to,
                            amount: [{
                                currency: networkIcon,
                                value: ethValue
                            }],
                            description: `You sent ${networkIcon} to ${String(usTr.to).slice(0, 18)}...`,
                            receiverDescription: `You received ${networkIcon} from ${String(usTr.from).slice(0, 15)}...`,
                            type: {
                                method: "Sent",
                                product: networkIcon
                            },
                            status: "completed",
                            walletInfo: {
                                fromAddress: usTr.from,
                                toAddress: usTr.to,
                                networkIcon,
                            },
                            extraInfo: {
                                trData: extraInfo
                            },
                            createdAt: new Date().toISOString()
                        })
                        await transaction.save();
                    }
                }
            })
        }
    })

}

module.exports = { getNetworkTransactions }