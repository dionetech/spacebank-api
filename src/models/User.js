const mongoose = require('mongoose');
const PasswordComplexity = require('joi-password-complexity');
const jwt = require('jsonwebtoken');
const randomid = require("randomid");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        lowercase: true,
    },
    balance: [{
        currency: String,
        value: Number,
    }],
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    name: {
        type: String,
    },
    uniqueID: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        unique: true,
    },
    profilePhoto: {
        type: String,
    },
    verifiedEmail: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: true,
    },
    passwordText: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
    },
    address: {
        type: String,
    },
    country: {
        type: String,
    },
    wallet: {
        type: Object,
    },
    dob: {
        type: Date,
    },
    doj: {
        type: Date,
        default: new Date().toISOString(),
    },
    refid: {
        type: String,
        default: randomid(10)
    },
    transactionPassword: {
        type: String,
        default: "1234"
    },
    created: { 
        type: Date,
        default: Date.now 
    },
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { _id: this._id, permission: this.permission },
        process.env.JWT_SECRET_KEY
    );
};

const User = mongoose.model('User', userSchema);

const validateUser = (user) => {
    const schema = Joi.object({
        password: new PasswordComplexity().required(),
    });
    return schema.validate(user);
};

module.exports = {
    User: User,
    validate: validateUser,
};
