const mongoose = require('mongoose');
const Joi = require('joi');

const withdrawalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        from: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: 'Pending',
        },
        comment: {
            type: String,
            default: 'No Comment',
        },
    },
    { timestamps: true }
);

const validateWithdrawal = (data) => {
    const schema = Joi.object({
        amount: Joi.number().required(),
        from: Joi.string().required(),
        payment_method: Joi.object().required(),
        address: Joi.string().required(),
        status: Joi.string(),
    });
    return schema.validate(data);
};

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = {
    Withdrawal,
    validate: validateWithdrawal,
};
