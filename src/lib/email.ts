const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.USER_NAME, // generated ethereal user
    pass: process.env.PASSWORD, // generated ethereal password
  },
});

export default transporter;

export const sendVerifyLink = async (token: string, email: string) => {
  let info = await transporter.sendMail({
    from: "liebsch@dipmaxexport.com",
    to: email,
    subject: `Welcome to Yaown, please verify your email address.`,
    text: `Please use this link ${process.env.BE_URL}/user/verify/${token}`,
    html: `<p>Welcome to Yaown, please verify your email address. <p><a href='${process.env.FE_URL}/user/verify/${token}'>Please click this link</a></p>`,
  });
};
