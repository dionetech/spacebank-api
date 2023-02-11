const jwt = require('jsonwebtoken');
const failedResponse = require('../helpers/failedResponse');

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token)
        return failedResponse(res, 401, 'Access Denied. No Token Provided');
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        next();
    } catch (ex) {
        return failedResponse(res, 400, 'Invalid Token');
    }
}
module.exports = auth;
