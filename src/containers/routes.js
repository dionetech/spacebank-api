const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const responseTime = require('response-time');

const AuthRoutes = require('../routes/public/auth');
const UserRoutes = require('../routes/private/user');
const TransactionRoutes = require('../routes/private/transaction');
const Index = require('../routes');

const error = require('../middleware/error');
// var whitelist = [
//     'http://localhost:5173',
//     'http://localhost:5174',
//     'http://localhost:5175',
//     'https://spacebank-app.vercel.app',
//     'https://spacebank.com'
// ];

var corsOptions = {
    exposedHeaders: 'x-auth-token',
    origin: "*",
};

module.exports = function (app){
    app.use(responseTime(function (req, res, time) {
        console.log("TIME:", `${time}MS`);
    }))

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(helmet());
    app.use(cors(corsOptions));
    app.use(express.static('public'));
    app.use(compression())

    // User Routes
    app.use('/api/v1/users', UserRoutes);
    // Transaction Routes
    app.use('/api/v1/transactions', TransactionRoutes);

    // PUBLIC

    //Auth
    app.use('/api/v1/auth', AuthRoutes);

    app.use('/api/v1/', Index);
    app.use('/api/', Index);
    app.use('/', Index);

    app.use('*', (req, res) => {
        res.status(404).json({
            data: {},
            status: 'failed',
            message: 'Please, try again later (555)',
        });
    });
    app.use(error);
}