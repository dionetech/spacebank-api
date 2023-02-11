const nodeMailer = require('nodemailer');

let transporter = nodeMailer.createTransport({
    pool: true,
    host: "mail.primefbx.com",
    port: 587,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})