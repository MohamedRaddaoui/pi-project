const productBacklog = require("../models/productBacklog");
const UserStory = require("../models/userStory");
const mongoose = require("mongoose");

// 

const createUserStory = async (req, res) => {
  try {
    const { backlogID, title, description, priority, storyPoints } = req.body;

    if (!backlogID || backlogID === "undefined") {
      return res.status(400).json({ message: "Le backlog est requis et doit être valide" });
    }

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(backlogID)) {
      return res.status(400).json({ message: "Le backlogID n'est pas un ObjectId valide" });
    }

    const userStory = new UserStory({
      title,
      description,
      priority,
      storyPoints,
      backlog: backlogID
    });

    await userStory.save();

    await productBacklog.findByIdAndUpdate(backlogID, {
      $push: { userStoriesId: userStory._id }
    });

    res.status(201).json({ message: "User Story créée avec succès", userStory });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la création de la User Story" });
  }
};





const getAllUserStories = async (req, res) => {
    try {
      const userStories = await UserStory.find();
      res.status(200).json(userStories);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la récupération des User Stories" });
    }
  };
  
  const updateUserStory = async (req, res) => {
    try {
      const updatedUserStory = await UserStory.findByIdAndUpdate(req.params.id,req.body, { new: true });
  
      if (!updatedUserStory) {
        return res.status(404).json({ message: "User Story non trouvée" });
      }
  
      res.status(200).json(updatedUserStory);
  
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la User Story" });
    }
  };
  


  const deleteUserStory = async (req, res) => {
    try {
      const deletedUserStory = await UserStory.findByIdAndDelete(req.params.id);
  
      if (!deletedUserStory) {
        return res.status(404).json({ message: "User Story non trouvée" });
      }
  
      res.status(200).json({ message: "User Story supprimée avec succès" });
  
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la suppression de la User Story" });
    }
  };


// async function filterUserStories(req, res){
//   try {
//     const filter = {};
//     if (req.query.sprintID) filter.sprintID = req.query.sprintID;
//     if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
//     const stories = await UserStory.find(filter);
//     res.json(stories);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


async function getStoryStats (req, res){
  try {
    const stats = await UserStory.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// PATCH /user-stories/:id/assign
async function assignUser (req, res) {
  try {
    const { userId } = req.body;
    const updated = await UserStory.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /user-stories/:id/unassign
async function  unassignUser (req, res){
  try {
    const updated = await UserStory.findByIdAndUpdate(
      req.params.id,
      { $unset: { assignedTo: "" } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET /user-stories/sprint/:sprintID
async function getUserStoriesBySprint (req, res) {
  try {
    const stories = await UserStory.find({ sprintID: req.params.sprintID }).populate("assignedTo");
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// Remove a user story from sprint
async function removeUserStoryFromSprint(req, res) {
  try {
    const userStory = await UserStory.findById(req.params.id);

    if (!userStory) {
      return res.status(404).json({ message: "User story not found" });
    }

    userStory.sprintId = null;
    await userStory.save();

    res.status(200).json({ message: "User story removed from sprint successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


async function getUserStoriesByBacklog (req, res) {
  try {
    const stories = await UserStory.find({ backlogID: req.params.sprintID }).populate();
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// GET /user-stories/sprint/:sprintID/story-points
async function getTotalStoryPoints (req, res) {
  try {
    const total = await UserStory.aggregate([
      { $match: { sprintID: new mongoose.Types.ObjectId(req.params.sprintID) } },
      { $group: { _id: null, totalPoints: { $sum: "$storyPoints" } } }
    ]);
    res.json({ totalPoints: total[0]?.totalPoints || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /user-stories/filter?status=Done&priority=High
async function filterUserStories (req, res){
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    const stories = await UserStory.find(query).populate("assignedTo sprintID");
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports={createUserStory,getAllUserStories,updateUserStory,deleteUserStory,filterUserStories,getStoryStats,assignUser,unassignUser,getUserStoriesBySprint,getUserStoriesByBacklog,removeUserStoryFromSprint,getTotalStoryPoints,filterUserStories};