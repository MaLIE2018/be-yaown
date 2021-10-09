"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerifyLink = void 0;
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.USER_NAME,
        pass: process.env.PASSWORD, // generated ethereal password
    },
});
exports.default = transporter;
const sendVerifyLink = async (emailToken, email) => {
    let info = await transporter.sendMail({
        from: "liebsch@dipmaxexport.com",
        to: email,
        subject: `Welcome to Yaown, please verify your email address.`,
        text: `Please use this link ${process.env.BE_URL}/user/verify/${emailToken}`,
        html: `<p>Welcome to Yaown, please verify your email address. <p><a href='${process.env.FE_URL}/verify?token=${emailToken}'>Please click this link</a></p>`,
    });
};
exports.sendVerifyLink = sendVerifyLink;
