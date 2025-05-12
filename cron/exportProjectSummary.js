const cron = require('node-cron');
const Project = require('../src/models/project');
const generateExcel = require('../utils/generateProjectSummary');
const {sendExcelSummary} = require('../utils/emailReminder');
const fs = require('fs');

cron.schedule('04 21 * * *', async () => {
  console.log('Cron résumé projet terminé lancé...');

  try {
    const projects = await Project.find({
      status: 'Done',
      summarySent: { $ne: true } // On ne renvoie pas deux fois
    }).populate('ownerID').populate('tasksID');

    for (const project of projects) {
      if (project.ownerID && project.tasksID.length > 0) {
        const filePath = await generateExcel(project);

        await sendExcelSummary(project.ownerID, filePath, project.title);

        // Marquer que le résumé a été envoyé
        project.summarySent = true;
        await project.save();

        // Supprimer le fichier après envoi
        fs.unlinkSync(filePath);

        console.log(`Résumé envoyé pour le projet "${project.title}"`);
      }
    }
  } catch (err) {
    console.error('Erreur en générant les résumés :', err.message);
  }
});
