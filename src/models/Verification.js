const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },

    details: {
        first_name: {
            type: String,
            default: '',
        },
        last_name: {
            type: String,
            default: '',
        },
        gender: {
            type: String,
            default: '',
            lowercase: true
        },
    },
}, { timestamps: true });

const Verification = mongoose.model('Verification', verificationSchema);


module.exports = Verification;