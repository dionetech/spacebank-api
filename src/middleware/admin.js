const failedResponseHandler = require("../helpers/failedResponse");

module.exports = function (req, res, next) {
    if (req.user.permission !== "sudo admin")
        return failedResponseHandler(res, 403, "Access Denied");
    next();
};