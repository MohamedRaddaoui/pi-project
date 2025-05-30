// utils/generateProjectSummaryExcel.js
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generateProjectSummaryExcel(project) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Résumé du projet');

  worksheet.columns = [
    { header: 'Titre', key: 'title', width: 30 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Date de début', key: 'startDate', width: 20 },
    { header: 'Date de fin', key: 'endDate', width: 20 },
    { header: 'Statut', key: 'status', width: 20 },
  ];

  worksheet.addRow({
    title: project.title,
    description: project.description || 'N/A',
    startDate: project.startDate?.toLocaleDateString('fr-FR'),
    endDate: project.endDate?.toLocaleDateString('fr-FR'),
    status: project.status,
  });

  worksheet.addRow({});
  worksheet.addRow({ title: 'Tâches' });

  worksheet.addRow({ title: 'Titre', description: 'Statut' });

  project.tasksID.forEach(task => {
    worksheet.addRow({ title: task.title, description: task.status });
  });

  const filePath = path.join(__dirname, '..', 'exports', `Projet_${project.title.replace(/\s+/g, '_')}.xlsx`);

  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

module.exports = generateProjectSummaryExcel;
