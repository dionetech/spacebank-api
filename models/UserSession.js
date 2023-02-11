const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "30m",
    },
});

const UserSession = mongoose.model("UserSession", userSessionSchema);

module.exports = UserSession;
