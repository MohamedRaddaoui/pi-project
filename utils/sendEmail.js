const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Or use another SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html, attachements = []) => {
  const mailOptions = {
    from: `"Support App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachements,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
