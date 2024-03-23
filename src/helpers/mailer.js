const nodeMailer = require('nodemailer');
const moment = require("moment");

let transporter = nodeMailer.createTransport({
    pool: true,
    host: "mail.hydrchain.com",
    port: 465,
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
        from: `"Spacebank"  <admin@spacebank.hydrchain.com>`,
        to: email,
        subject: "Hello, please receive your verification code",
        html: `<p>Your Spacebank verification code is [${otp}] - ${moment().format('lll')}</p>`,
    };
    const sent = await transporter.sendMail(mailOptions);
  
    if (sent.response.includes('OK')) return sent;
}

async function UserAuthorizationOTP(email, otp) {
    let mailOptions = {
        from: `"Spacebank"  <admin@spacebank.hydrchain.com>`,
        to: email,
        subject: "Hello, please receive your authorization code",
        html: `<p>You requested to change your Spacebank account password, Your Spacebank authorization code is [${otp}] - ${moment().format('lll')}</p>`,
    };
    const sent = await transporter.sendMail(mailOptions);
  
    if (sent.response.includes('OK')) return sent;
}

async function TransactionNotificationEmail(email, transactionDescription) {
    let mailOptions = {
        from: `"Spacebank" <admin@spacebank.hydrchain.com>`,
        to: email,
        subject: "Successful Transaction",
        html: `<p>${transactionDescription} - ${moment().format('lll')}</p>`,
    };
    const sent = await transporter.sendMail(mailOptions);
  
    if (sent.response.includes('OK')) return sent;
}

module.exports = {
    EmailVerificationOTP,
    UserAuthorizationOTP,
    TransactionNotificationEmail
};