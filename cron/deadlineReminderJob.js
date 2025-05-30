const cron = require('node-cron');
const Project = require('../src/models/project'); // Modèle Project
const sendDeadlineReminder = require('../utils/emailReminder'); // Fonction pour envoyer l'email

// Planification de la tâche cron pour l'exécution quotidienne à minuit
cron.schedule('13 17 * * *', async () => {
  console.log('Cron task is running at 00:27 AM...');

  try {
    // Recherche des projets dont la date de fin approche (par exemple dans les 3 jours)
    const projects = await Project.find({
      endDate: {
        $gte: new Date(), // Aujourd'hui
        $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours après aujourd'hui
      },
      archived: false, // On ignore les projets archivés
      status: 'In Progress' // Filtrer uniquement les projets en cours
    })
    .populate('ownerID')  // Populate des utilisateurs
    .populate('tasksID');  // Utilisation du bon champ 'tasksID' au lieu de 'tasks'

    // Envoi des rappels uniquement au propriétaire du projet
    for (const project of projects) {
      const user = project.ownerID;
      
      // Vérifier que le propriétaire (user) est bien défini
      if (user && user.firstname) {
        console.log(`Vérification du projet : "${project.title}" pour l'utilisateur ${user.firstname}`);

        // Vérifier que project.tasksID est bien un tableau
        if (Array.isArray(project.tasksID)) {
          // Si project.tasksID est un tableau, filtrer les tâches non complètes
          const incompleteTasks = project.tasksID.filter(task => task.status !== 'Done');

          if (incompleteTasks.length > 0) {
            console.log(`Envoi du rappel : Projet "${project.title}" en cours avec des tâches non complètes.`);
            const incompleteTaskList = incompleteTasks.map(task => `- ${task.title}`).join('\n');

            const reminderMessage = `
            <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333;">
              <p style="font-size: 14px; font-weight: bold; color: #2c3e50;">
                Objet : Suivi des tâches restantes – Projet "${project.title}"
              </p>
          
              <p>Bonjour ${user.firstname},</p>
          
              <p>
                Nous approchons de la phase finale du projet <strong>"${project.title}"</strong>, et certaines tâches demeurent inachevées :
              </p>
          
              <div>
                ${incompleteTaskList}
              </div>
          
              <p>
                Nous vous prions de bien vouloir faire le point avec les membres de votre équipe afin de garantir la finalisation de l’ensemble des livrables avant la date limite fixée au <strong>${project.endDate.toLocaleDateString('fr-FR')}</strong>.
              </p>
          
              <p>Cordialement,</p>
              <p>L’équipe de gestion de projet</p>
            </div>
          `;
          


            console.log("Contenu du message : bon recu");

            await sendDeadlineReminder(project, user, reminderMessage);
          } else {
            console.log(`Le projet "${project.title}" est en cours mais toutes les tâches sont complètes.`);
          }
        } else {
          console.log(`Le projet "${project.title}" n'a pas de tâches définies ou 'tasksID' est vide.`);
        }
      } else {
        console.log(`Le projet "${project.title}" n'a pas de propriétaire valide ou 'ownerID' est manquant.`);
      }
    }

    // console.log('Rappels envoyés avec succès.');
  } catch (error) {
    console.error('Erreur lors de la vérification des projets :', error.message);
  }
});
