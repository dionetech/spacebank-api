const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const AuthRoutes = require('../routes/public/auth');
const UserRoutes = require('../routes/user');
const TransactionRoutes = require('../routes/transaction');
const Index = require('../routes');

const error = require('../middleware/error');
var whitelist = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://spacebank-app.vercel.app',
    'https://spacebank.com'
];

var corsOptions = {
    exposedHeaders: 'x-auth-token',
    origin: whitelist,
};

module.exports = function (app){
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(helmet());
    app.use(cors(corsOptions));
    app.use(express.static('public'));

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