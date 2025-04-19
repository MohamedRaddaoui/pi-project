const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Or use another SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Event Organizer" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachements,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
