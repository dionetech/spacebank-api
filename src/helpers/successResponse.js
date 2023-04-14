module.exports = function (res, statusCode, data = {}, message, token, otp) {
    res.header('x-auth-token', token).status(statusCode).json({
        success: true,
        code: 200,
        data,
        message,
        otp,
    });
};