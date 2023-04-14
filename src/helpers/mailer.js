const nodeMailer = require('nodemailer');
const moment = require("moment");

let transporter = nodeMailer.createTransport({
    pool: true,
    host: "mail.myspacebank.com",
    port: 587,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

async function EmailVerificationOTP(email, otp) {
    let mailOptions = {
        from: `"Spacebank"  <admin@myspacebank.com>`,
        to: email,
        subject: "Hello, please receive your verification code",
        html: `<p>Your Spacebank verification code is [${otp}] - ${moment().format('lll')}</p>`,
    };
    const sent = await transporter.sendMail(mailOptions);
  
    if (sent.response.includes('OK')) return sent;
}

module.exports = {
    EmailVerificationOTP,
};