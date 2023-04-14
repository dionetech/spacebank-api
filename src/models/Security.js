const mongoose = require('mongoose');

const securitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        security_question: {
            type: Object,
        },
        security_note: {
            type: String
        },
        twoStepVerification: {
            type: Boolean,
            default: false,
        },
    }
);

const Security = mongoose.model('Security', securitySchema);

module.exports = Security
