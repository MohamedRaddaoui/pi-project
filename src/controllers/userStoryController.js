const productBacklog = require("../models/productBacklog");
const UserStory = require("../models/userStory");
const Sprint = require("../models/sprintProduct")
const mongoose = require("mongoose");

// 

const createUserStory = async (req, res) => {
  try {
    // Récupérer les données, y compris backlogID
    const { backlogID, title, description, priority, storyPoints, status } = req.body;

    // --- Validation de backlogID --- 
    if (!backlogID || backlogID === "undefined") {
      console.error("[Backend - createUserStory] Erreur: backlogID manquant ou invalide dans req.body");
      return res.status(400).json({ message: "L'ID du backlog est requis et doit être valide" });
    }
    if (!mongoose.Types.ObjectId.isValid(backlogID)) {
      console.error("[Backend - createUserStory] Erreur: backlogID n'est pas un ObjectId valide:", backlogID);
      return res.status(400).json({ message: "Le backlogID fourni n'est pas un ObjectId valide" });
    }
    // Vérifier si le backlog existe réellement (optionnel mais recommandé)
    const existingBacklog = await productBacklog.findById(backlogID);
    if (!existingBacklog) {
      console.error("[Backend - createUserStory] Erreur: Aucun backlog trouvé avec l'ID:", backlogID);
      return res.status(404).json({ message: "Le backlog associé n'a pas été trouvé" });
    }
    // --- Fin Validation --- 

    // Créer la nouvelle User Story avec le nom de champ CORRECT
    const userStory = new UserStory({
      title,
      description,
      priority, // Assurez-vous que le frontend envoie bien 'priority'
      storyPoints,
      status: status || 'To Do', // Utiliser le statut reçu ou 'To Do' par défaut
      backlogID: backlogID // <-- CORRIGÉ ICI
    });

    // Sauvegarder la User Story
    await userStory.save();
    console.log("[Backend - createUserStory] User Story sauvegardée avec succès:", userStory._id);

    // Mettre à jour le backlog pour ajouter la référence à la nouvelle User Story
    await productBacklog.findByIdAndUpdate(backlogID, {
      $push: { userStoriesId: userStory._id }
    });
    console.log("[Backend - createUserStory] Backlog mis à jour avec succès:", backlogID);

    // Renvoyer une réponse de succès
    res.status(201).json({ message: "User Story créée avec succès", userStory });

  } catch (error) {
    console.error("[Backend - createUserStory] Erreur serveur:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création de la User Story" });
  }
};





const getAllUserStories = async (req, res) => {
    try {
      const userStories = await UserStory.find().populate("backlogID");
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
    const userStoryId = req.params.id;

    // Supprimer la User Story de la collection UserStory
    const deletedUserStory = await UserStory.findByIdAndDelete(userStoryId);

    if (!deletedUserStory) {
      return res.status(404).json({ message: "User Story non trouvée" });
    }

    // Supprimer la User Story de la collection Backlog si elle y est référencée
    await Backlog.updateMany(
      { userStories: userStoryId },             // Supposons que tu as un champ `userStories` (array d'IDs)
      { $pull: { userStories: userStoryId } }   // Retire l'ID de la liste
    );

    res.status(200).json({ message: "User Story supprimée avec succès" });

  } catch (error) {
    console.error(error);
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


async function getUserStoriesByBacklog(req, res) {
  try {
    // 1. Récupérer l'ID depuis les paramètres de l'URL
    const backlogIdFromUrl = req.params.id;
    console.log("[Backend - getUserStoriesByBacklog] ID du backlog recherché:", backlogIdFromUrl);

    // Vérification simple que l'ID existe
    if (!backlogIdFromUrl) {
      console.error("[Backend - getUserStoriesByBacklog] ID du backlog manquant dans req.params.id");
      return res.status(400).json({ message: "ID du backlog manquant dans l'URL" });
    }

    // 2. Utiliser le nom de champ 'backlogID' (confirmé par votre modèle)
    //    pour chercher les User Stories correspondantes.
    const stories = await UserStory.find({ backlogID: backlogIdFromUrl });

    console.log("[Backend - getUserStoriesByBacklog] Nombre de stories trouvées:", stories.length);
    // Optionnel: logguer les stories trouvées (peut être volumineux)
    // console.log("[Backend - getUserStoriesByBacklog] Stories trouvées:", JSON.stringify(stories));

    // 3. Renvoyer les stories trouvées (sera un tableau vide [] si aucune n'est trouvée)
    res.json(stories);

  } catch (err) {
    console.error("[Backend - getUserStoriesByBacklog] Erreur lors de la récupération des stories:", err);
    // Gérer spécifiquement les erreurs de format d'ID (CastError)
    if (err.name === 'CastError') {
       return res.status(400).json({ message: "Format de l'ID du backlog invalide." });
    }
    // Gérer les autres erreurs serveur
    res.status(500).json({ message: "Erreur interne du serveur lors de la récupération des user stories." });
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

// DELETE /user-stories/:id/remove-from-backlog
async function removeUserStoryFromBacklog(req, res) {
  try {
    const userStoryId = req.params.id;

    // Vérifier si la User Story existe
    const userStory = await UserStory.findById(userStoryId);
    if (!userStory) {
      return res.status(404).json({ message: "User Story non trouvée" });
    }

    const backlogID = userStory.backlogID;

    // Mettre à jour le backlog en retirant la référence à cette user story
    if (backlogID) {
      await productBacklog.findByIdAndUpdate(backlogID, {
        $pull: { userStoriesId: userStoryId }
      });
      console.log(`[Backend - removeUserStoryFromBacklog] Référence supprimée du backlog ${backlogID}`);
    }

    // Supprimer la référence au backlog dans la User Story elle-même
    userStory.backlogID = null;
    await userStory.save();

    res.status(200).json({ message: "User Story retirée du backlog avec succès" });

  } catch (error) {
    console.error("[Backend - removeUserStoryFromBacklog] Erreur:", error);
    res.status(500).json({ message: "Erreur serveur lors du retrait de la User Story du backlog" });
  }
}

async function addUserStoryToBacklog(req, res) {
  try {
    const { userStoryId, backlogId } = req.body;

    // Vérifie que les deux existent
    const userStory = await UserStory.findById(userStoryId);
    const backlog = await productBacklog.findById(backlogId);

    if (!userStory || !backlog) {
      return res.status(404).json({ message: "User story ou backlog introuvable" });
    }

    // Associer la user story au backlog
    userStory.backlogID = backlog._id;
    await userStory.save();

    // Ajouter à la liste des user stories du backlog s'il n'y est pas déjà
    if (!backlog.userStoriesId.includes(userStory._id)) {
      backlog.userStoriesId.push(userStory._id);
      await backlog.save();
    }

    res.status(200).json({ message: "User story ajoutée au backlog avec succès" });
  } catch (error) {
    console.error("[Backend - addUserStoryToBacklog]", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

async function removeUserStoryFromSprintEX(req, res) {
  try {
    const userStoryId = req.params.id;

    // 1. Trouver le Sprint qui contient cette UserStory
    // (La méthode exacte dépend de votre modèle de données, 
    // ceci est un exemple avec Mongoose/MongoDB)
    const sprint = await Sprint.findOne({ userStories: userStoryId });

    if (!sprint) {
      // La story n'était dans aucun sprint, ou problème de données
      console.warn(`Aucun sprint trouvé contenant la user story ${userStoryId}`);
      // Peut-être quand même mettre à jour la story ?
      await UserStory.findByIdAndUpdate(userStoryId, { sprintId: null });
      return res.status(200).json({ message: "User story n'était dans aucun sprint, champ sprintId mis à null." });
    }

    // 2. Retirer l'ID de la UserStory du tableau userStories du Sprint
    sprint.userStories.pull(userStoryId); // Méthode Mongoose pour retirer d'un tableau

    // 3. Sauvegarder le Sprint modifié
    await sprint.save();

    // 4. (Optionnel) Mettre à jour la UserStory elle-même
    await UserStory.findByIdAndUpdate(userStoryId, { sprintId: null });

    res.status(200).json({ message: "User story retirée du sprint avec succès" });

  } catch (error) {
    console.error("Erreur lors du retrait de la user story du sprint:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


module.exports={createUserStory,getAllUserStories,updateUserStory,deleteUserStory,filterUserStories,getStoryStats,assignUser,unassignUser,getUserStoriesBySprint,getUserStoriesByBacklog,removeUserStoryFromSprint,getTotalStoryPoints,filterUserStories,removeUserStoryFromBacklog,addUserStoryToBacklog,removeUserStoryFromSprintEX};