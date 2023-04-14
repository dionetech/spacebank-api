const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    deviceInfo: {
        type: Object,
    },
    deviceType: {
        type: String
    },
    deviceID: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: new Date().toISOString(),
    },
});

const UserSession = mongoose.model("UserSession", userSessionSchema);

module.exports = UserSession;
