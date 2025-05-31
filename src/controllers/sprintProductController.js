const Sprint = require('../models/sprintProduct');
const UserStory = require('../models/userStory');
const Event=require('../models/event');

// ➕ Create
// Assurez-vous que les modèles Sprint et Event sont correctement importés
// const Sprint = require('../models/Sprint'); // Exemple
// const Event = require('../models/Event');   // Exemple

// Fonction pour combiner date et heure (fournie par vous)
function combineDateTime(date, timeStr) {
  const dateObj = new Date(date);
  // Gérer le cas où timeStr est null ou undefined
  if (!timeStr) {
      console.warn(`[combineDateTime] timeStr est manquant pour la date ${date}. Retourne la date originale.`);
      return dateObj; // Ou gérer l'erreur comme vous préférez
  }
  const parts = timeStr.split(':');
  if (parts.length !== 2) {
      console.warn(`[combineDateTime] Format timeStr invalide: ${timeStr}. Attendu HH:MM.`);
      // Retourner une valeur par défaut ou lancer une erreur ?
      // Pour l'instant, on retourne la date sans modifier l'heure
      return dateObj; 
  }
  const [hours, minutes] = parts.map(Number);
  // Vérifier si hours et minutes sont des nombres valides
  if (isNaN(hours) || isNaN(minutes)) {
      console.warn(`[combineDateTime] Heures ou minutes invalides dans timeStr: ${timeStr}`);
      return dateObj;
  }
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj;
}

// Fonction createSprint corrigée avec logs
async function createSprint(req, res) { // Supposons que c'est un handler Express
  try {
    const { title, goal, start_date, end_date, dailyStartTime, dailyEndTime, reviewStartTime, reviewEndTime, retroStartTime, retroEndTime } = req.body;
    const projectID = req.params.id;

    // Vérifications basiques des entrées (optionnel mais recommandé)
    if (!title || !start_date || !end_date || !projectID || !dailyStartTime || !dailyEndTime || !reviewStartTime || !reviewEndTime || !retroStartTime || !retroEndTime) {
        return res.status(400).json({ message: "Données manquantes pour la création du sprint." });
    }

    // 1. Créer le sprint
    const sprint = new Sprint({
      title,
      goal,
      start_date,
      end_date,
      projectID,
      planning: [],
      reviews: [],
      retrospectives: []
    });
    await sprint.save();
    console.log(`[DEBUG SPRINT] Sprint créé avec ID: ${sprint._id}`);

    // 2. Créer les Daily Meetings
    const planningEvents = [];
    let currentDate = new Date(start_date);
    const finalDate = new Date(end_date);

    // Assurez-vous que la boucle ne dépasse pas la date de fin
    while (currentDate <= finalDate) {
      const dailyStartTimeValue = combineDateTime(currentDate, dailyStartTime);
      const dailyEndTimeValue = combineDateTime(currentDate, dailyEndTime);

      // *** LOGS POUR DAILY MEETING ***
      console.log(`[DEBUG EVENT SAVE] Event Title: Daily Meeting`);
      console.log(`[DEBUG EVENT SAVE] Date Used: ${currentDate.toISOString().split('T')[0]}`); // Juste la date
      console.log(`[DEBUG EVENT SAVE] Start Time (ISO): ${dailyStartTimeValue.toISOString()}`);
      console.log(`[DEBUG EVENT SAVE] End Time (ISO): ${dailyEndTimeValue.toISOString()}`);
      console.log(`[DEBUG EVENT SAVE] Is endTime > startTime ? : ${dailyEndTimeValue > dailyStartTimeValue}`);

      const dailyMeetingEvent = new Event({
        title: 'Daily Meeting',
        date: new Date(currentDate.setHours(0, 0, 0, 0)), // Stocker la date sans heure
        startTime: dailyStartTimeValue,
        endTime: dailyEndTimeValue,
        type: 'Meeting',
        projectID,
        sprintID: sprint._id,
        repeat: 'None'
      });

      try {
        await dailyMeetingEvent.save();
        planningEvents.push(dailyMeetingEvent._id);
      } catch (validationError) {
        console.error("[DEBUG EVENT SAVE] Validation Error (Daily):", validationError);
        // Il est important de remonter l'erreur ou de gérer l'échec
        return res.status(400).json({ message: `Erreur de validation pour Daily Meeting: ${validationError.message}` });
      }

      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 3. Créer Sprint Review
    const reviewDate = new Date(end_date);
    const reviewStartTimeValue = combineDateTime(reviewDate, reviewStartTime);
    const reviewEndTimeValue = combineDateTime(reviewDate, reviewEndTime);

    // *** LOGS POUR REVIEW ***
    console.log(`[DEBUG EVENT SAVE] Event Title: Sprint Review`);
    console.log(`[DEBUG EVENT SAVE] Date Used: ${reviewDate.toISOString().split('T')[0]}`);
    console.log(`[DEBUG EVENT SAVE] Start Time (ISO): ${reviewStartTimeValue.toISOString()}`);
    console.log(`[DEBUG EVENT SAVE] End Time (ISO): ${reviewEndTimeValue.toISOString()}`);
    console.log(`[DEBUG EVENT SAVE] Is endTime > startTime ? : ${reviewEndTimeValue > reviewStartTimeValue}`);

    const reviewEvent = new Event({
      title: 'Sprint Review',
      date: new Date(reviewDate.setHours(0, 0, 0, 0)),
      startTime: reviewStartTimeValue,
      endTime: reviewEndTimeValue,
      type: 'Meeting',
      projectID,
      sprintID: sprint._id,
      repeat: 'None'
    });

    try {
      await reviewEvent.save();
    } catch (validationError) {
      console.error("[DEBUG EVENT SAVE] Validation Error (Review):", validationError);
      return res.status(400).json({ message: `Erreur de validation pour Sprint Review: ${validationError.message}` });
    }

    // 4. Créer Sprint Retrospective
    const retroDate = new Date(end_date);
    const retroStartTimeValue = combineDateTime(retroDate, retroStartTime);
    const retroEndTimeValue = combineDateTime(retroDate, retroEndTime);

    // *** LOGS POUR RETROSPECTIVE ***
    console.log(`[DEBUG EVENT SAVE] Event Title: Sprint Retrospective`);
    console.log(`[DEBUG EVENT SAVE] Date Used: ${retroDate.toISOString().split('T')[0]}`);
    console.log(`[DEBUG EVENT SAVE] Start Time (ISO): ${retroStartTimeValue.toISOString()}`);
    console.log(`[DEBUG EVENT SAVE] End Time (ISO): ${retroEndTimeValue.toISOString()}`);
    console.log(`[DEBUG EVENT SAVE] Is endTime > startTime ? : ${retroEndTimeValue > retroStartTimeValue}`);

    const retrospectiveEvent = new Event({
      title: 'Sprint Retrospective',
      date: new Date(retroDate.setHours(0, 0, 0, 0)),
      startTime: retroStartTimeValue,
      endTime: retroEndTimeValue,
      type: 'Meeting',
      projectID,
      sprintID: sprint._id,
      repeat: 'None'
    });

    try {
      await retrospectiveEvent.save();
    } catch (validationError) {
      console.error("[DEBUG EVENT SAVE] Validation Error (Retro):", validationError);
      return res.status(400).json({ message: `Erreur de validation pour Sprint Retrospective: ${validationError.message}` });
    }

    // 5. Mettre à jour le sprint avec les références aux events
    sprint.planning = planningEvents;
    sprint.reviews = [reviewEvent._id];
    sprint.retrospectives = [retrospectiveEvent._id];
    await sprint.save(); // Sauvegarder les références dans le sprint

    console.log(`[DEBUG SPRINT] Sprint ${sprint._id} mis à jour avec les IDs des événements.`);

    // Renvoyer le sprint complet avec les IDs des événements
    // Vous pourriez vouloir peupler les événements ici avant de renvoyer si nécessaire
    return res.status(201).json(sprint);

  } catch (err) {
    // Gérer les erreurs générales qui n'ont pas été interceptées avant
    console.error('Error creating sprint (catch général):', err);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message || 'Erreur interne du serveur lors de la création du sprint.' });
    }
  }
}

// 📖 Get all
async function getAllSprints (req, res){
  try {
    const sprints = await Sprint.find().populate('userStories planning reviews retrospectives');
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📖 Get one
async function getSprintById (req, res){
  try {
    const sprint = await Sprint.findById(req.params.id)
    .populate('userStories')
    .populate('projectID')
    .populate('planning')
    .populate('reviews')
    .populate('retrospectives');
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 📖 Get one by project and backlog
async function getSprintByProject(req, res) {
  try {
    const {id} = req.params;

    const sprint = await Sprint.find({ projectID: id }).populate("userStories");

    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found for the given project and backlog' });
    }

    res.json(sprint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// ✏️ Update
async function updateSprint (req, res) {
  try {
    const updatedSprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSprint) return res.status(404).json({ error: 'Sprint not found' });
    res.json(updatedSprint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ❌ Delete
async function deleteSprint (req, res){
  try {
    const deleted = await Sprint.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Sprint not found' });
    res.json({ message: 'Sprint deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


async function startSprint (req, res){
  try {
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { status: 'In Progress', start_date: new Date() },
      { new: true }
    );
    res.json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function completeSprint (req, res) {
  try {
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed', end_date: new Date() },
      { new: true }
    );
    res.json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Dans votre contrôleur de sprints
 async function  addUserStoryToSprint (req, res) {
  try {
    const { sprintId } = req.params;
    const { userStoryId } = req.body;
    
    // Vérifier que le sprint existe
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint non trouvé' });
    }
    
    // Vérifier que la user story existe
    const userStory = await UserStory.findById(userStoryId);
    if (!userStory) {
      return res.status(404).json({ message: 'User Story non trouvée' });
    }
    
    // Ajouter la user story au sprint
    if (!sprint.userStories) {
      sprint.userStories = [];
    }
    
    // Vérifier si la user story n'est pas déjà dans le sprint
    if (!sprint.userStories.includes(userStoryId)) {
      sprint.userStories.push(userStoryId);
      await sprint.save();
    }
    
    // Optionnel : Retirer la user story du backlog
    // Cela dépend de votre logique métier
    
    res.status(200).json({ message: 'User Story ajoutée au sprint avec succès', sprint });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la user story au sprint:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}

async function getActiveSprintsByProject (req, res) {
  try {
    const sprints = await Sprint.find({
      projectID: req.params.projectId,
      status: 'In Progress'
    }).populate('userStories');

    res.json(sprints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function checkIfSprintIsLate (req, res) {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });

    const today = new Date();
    const isLate = sprint.status !== 'Completed' && sprint.end_date < today;

    res.json({ sprintId: sprint._id, isLate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports={createSprint,getAllSprints,getSprintById,getSprintByProject,updateSprint,deleteSprint,startSprint,addUserStoryToSprint,getActiveSprintsByProject,checkIfSprintIsLate}