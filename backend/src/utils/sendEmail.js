// backend/src/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com', // Example for Gmail
        port: process.env.EMAIL_PORT || 587, // Example for Gmail
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Your email address from .env
            pass: process.env.EMAIL_PASS, // Your email password or app password from .env
        },
        tls: {
            rejectUnauthorized: false // Avoids "self-signed certificate" errors if using local SMTP
        }
    });

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Gestão de Relatórios'}" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.text, // Fallback for clients that don't render HTML
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;