const Sprint = require('../models/sprintProduct');
const UserStory = require('../models/userStory');
const Event=require('../models/event');

// ➕ Create
async function createSprint(req, res) {
  try {
    const { title, goal, start_date, end_date, dailyStartTime, dailyEndTime, reviewStartTime, reviewEndTime, retroStartTime, retroEndTime } = req.body;
    const projectID = req.params.id;

    // 1. Créer le sprint sans startTime/endTime (car c'est dans Event)
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

    // 2. Créer les daily meetings pour chaque jour entre start_date et end_date
    const planningEvents = [];
    let currentDate = new Date(start_date);
    while (currentDate <= new Date(end_date)) {
      const startTime = combineDateTime(currentDate, dailyStartTime);
      const endTime = combineDateTime(currentDate, dailyEndTime);

      const dailyMeetingEvent = new Event({
        title: 'Daily Meeting',
        date: new Date(currentDate),   // date sans heure
        startTime,
        endTime,
        type: 'Meeting',
        projectID,
        sprintID: sprint._id,
        repeat: 'None'
      });

      await dailyMeetingEvent.save();
      planningEvents.push(dailyMeetingEvent._id);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 3. Créer Sprint Review event
    const reviewEvent = new Event({
      title: 'Sprint Review',
      date: new Date(end_date),
      startTime: combineDateTime(new Date(end_date), reviewStartTime),
      endTime: combineDateTime(new Date(end_date), reviewEndTime),
      type: 'Meeting',
      projectID,
      sprintID: sprint._id,
      repeat: 'None'
    });
    await reviewEvent.save();

    // 4. Créer Sprint Retrospective event
    const retrospectiveEvent = new Event({
      title: 'Sprint Retrospective',
      date: new Date(end_date),
      startTime: combineDateTime(new Date(end_date), retroStartTime),
      endTime: combineDateTime(new Date(end_date), retroEndTime),
      type: 'Meeting',
      projectID,
      sprintID: sprint._id,
      repeat: 'None'
    });
    await retrospectiveEvent.save();

    // 5. Mettre à jour le sprint avec les références aux events
    sprint.planning = planningEvents;
    sprint.reviews = [reviewEvent._id];
    sprint.retrospectives = [retrospectiveEvent._id];
    await sprint.save();

    return sprint;
    

  } catch (err) {
    console.error('Error creating sprint:', err);
    throw err;
  }
}

function combineDateTime(date, timeStr) {
  const dateObj = new Date(date);
  const [hours, minutes] = timeStr.split(':').map(Number);
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj;
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
    const sprint = await Sprint.findById(req.params.id).populate('userStories planning reviews retrospectives');
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