require('dotenv').config();
const express = require('express');
const app = express();
const Sentry = require("@sentry/node");
const SentryTracing = require("@sentry/tracing");
const { User } = require('./src/models/User');
const getWalletTransactions = require('./src/helpers/getWalletTransactions');
const Transaction = require('./src/models/Transaction');
const ethers = require('ethers');
const Web3Utils = require('web3-utils');
const { DSN } = process.env;

Sentry.init({
    dsn: DSN,
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new SentryTracing.Integrations.Express({ app }),
        new SentryTracing.Integrations.Mongo({ useMongoose: true })
    ],
    tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

require('./src/containers/logger')();
require('./src/containers/database')();
require('./src/containers/routes')(app);

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

const checkIfTransaction = (fromAddress, walletAddresses) => {
    var found = walletAddresses.includes(fromAddress);
    return found;
}

async function getUserTr(){
    const users = await User.find();
    let walletAddresses = [];
    users.map((user) => {
        walletAddresses.push(user.wallet.address);
    })

    users.map(async (user) => {
        let transactions = await getWalletTransactions(user.wallet.address);
        transactions.map(async (tr) => {
            if (tr.from!==user.wallet.address){
                const trExist = checkIfTransaction(tr.from, walletAddresses);
                if (!trExist){
                    const ethValue = Web3Utils.fromWei(tr.value);
                    let extraInfo = {
                        blockNumber: tr.blockNumber,
                        hash: tr.hash,
                        nonce: tr.nonce,
                        blockHash: tr.blockHash,
                        transactionIndex: tr.transactionIndex,
                        from: tr.from,
                        to: tr.to,
                        value: ethValue,
                        gas: tr.gas,
                        gasPrice: tr.gasPrice,
                        isError: tr.isError,
                        txreceipt_status: tr.txreceipt_status,
                        input: tr.input,
                        contractAddress: tr.contractAddress,
                        cumulativeGasUsed: tr.cumulativeGasUsed,
                        gasUsed: tr.gasUsed,
                        confirmations: tr.confirmations,
                        methodId: tr.methodId,
                        functionName: tr.functionName,
                        gottenFromWallet: true,
                    };
                    let networkIcon = getNetworkIcon(tr.contractAddress)
                    const transaction = new Transaction({
                        sender: tr.from,
                        receiver: tr.to,
                        amount: ethValue,
                        description: `You sent ${networkIcon} to ${String(tr.to).slice(0, 20)}...`,
                        receiverDescription: `You received ${networkIcon} from ${String(tr.from).slice(0, 18)}...`,
                        type: `sent-${networkIcon}`,
                        receiverType: `received-${networkIcon}`,
                        status: "confirmed",
                        icon: networkIcon,
                        mode: "outgoing",
                        receiverMode: "incoming",
                        walletInfo: {
                            fromAddress: tr.from,
                            toAddress: tr.to,
                            privateKey: user.wallet.privateKey,
                            networkIcon,
                        },
                        extraInfo: extraInfo,
                        createdAt: new Date().toISOString()
                    });
                    await transaction.save();
                }
            }
        });
    })
}
getUserTr();

setInterval(getUserTr, 1000)

const PORT = process.env.PORT;

app.listen(PORT, () => {
	console.log("Server is running on port: ", PORT);
})

module.exports = app;