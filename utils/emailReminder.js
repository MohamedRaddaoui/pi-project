const nodemailer = require('nodemailer');
// Configurer le transporteur
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'projetgroup519@gmail.com', // Ton email d'envoi
      pass: 'lzca dgcp fwzh ytce', // Mot de passe de ton compte email (il peut être préférable d'utiliser un mot de passe d'application spécifique)
    },
  });
  
  async function sendDeadlineReminder  (Project, User,reminderMessage){
    const mailOptions = {
      from: 'projetgroup519@gmail.com',
      to: Project.ownerID.email, // L'email du destinataire
      subject: `Rappel : La date limite du projet "${Project.title}" approche`,
      text: reminderMessage,
  
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Rappel envoyé à ${User.email} pour le projet "${Project.title}"`);
    } catch (error) {
      console.error(`Erreur lors de l'envoi du rappel à ${User.email}: ${error.message}`);
    }
  };
  
module.exports=sendDeadlineReminder