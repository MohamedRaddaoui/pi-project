const Sprint = require('../models/sprintProduct');
const UserStory = require('../models/userStory');

// ➕ Create
async function createSprint (req, res) {
  try {
    const sprint = await Sprint.create(req.body);
    res.status(201).json(sprint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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


async function addUserStoryToSprint (req, res) {
  try {
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { userStories: req.body.userStoryId } },
      { new: true }
    );
    res.json(sprint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



async function addDailyMeeting (req, res){
  try {
    // Créer un événement "Daily Meeting"
    const dailyMeeting = new Event({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      type: 'Meeting', // spécifie que c'est une réunion
      maxAttendees: req.body.maxAttendees,
      attendees: req.body.attendees, // Ajoutez les utilisateurs ici si nécessaire
      createdBy: req.body.createdBy,
      status: 'Scheduled',
      visibility: req.body.visibility || 'Private', // Par défaut, privé
      repeat: 'None', // Ne pas répéter (peut être modifié selon les besoins)
    });

    // Sauvegarder l'événement dans la collection Event
    const savedMeeting = await dailyMeeting.save();

    // Mettre à jour le Sprint en ajoutant l'ID de l'événement
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id, // L'ID du sprint
      { $addToSet: { planning: savedMeeting._id } }, // Ajoute l'ID de l'événement dans 'planning'
      { new: true }
    );

    // Retourner la réponse avec les données mises à jour
    res.status(200).json({
      message: 'Daily Meeting ajouté avec succès!',
      sprint,
      event: savedMeeting
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



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


async function addReview (req, res) {
  try {
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { reviews: req.body.eventId } },
      { new: true }
    );
    res.json(sprint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

async function addRetrospective (req, res){
  try {
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { retrospectives: req.body.eventId } },
      { new: true }
    );
    res.json(sprint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



  


module.exports={createSprint,getAllSprints,getSprintById,updateSprint,deleteSprint,startSprint,addUserStoryToSprint,addDailyMeeting,getActiveSprintsByProject,checkIfSprintIsLate,addReview,addRetrospective}