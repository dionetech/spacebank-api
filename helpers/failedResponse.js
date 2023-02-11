module.exports = function (res, statusCode, error, message) {
    res.status(statusCode).json({
        code: 400,
        success: false,
        error,
        message,
    });
};