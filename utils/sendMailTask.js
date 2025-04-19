const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

// Fonction pour envoyer un email avec un template
const sendEmail = async (to, subject, templateData) => {
  try {
    // Lire le fichier template HTML
    const templatePath = path.join(__dirname, "../templates/taskUpdateTemplate.html");
    let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

    // Remplir le template avec les données
    let emailHtml = handlebars.compile(htmlTemplate)(templateData);

    // Créer un transporteur de mail avec les informations d"authentification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
         user: "projetgroup519@gmail.com", // Ton email d"envoi
      pass: "lzca dgcp fwzh ytce", 
      },
       tls: {
        rejectUnauthorized: false  // Désactiver la vérification SSL
       }
    });

    // Envoyer l"email
    await transporter.sendMail({
      from: `"Orkestra" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: emailHtml
    });

    console.log("Email sent successfully!");

  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

module.exports = sendEmail;
