const Project = require("../models/project");
const Task = require("../models/Task/task");



// 📌 Create new Project
async function createProject(req, res){
    try{
        
        const project = new Project (req.body);
        console.log(req.body) 
        await project.save();
         res.status(201).json({message:"Project created successfully", project:project});
         
    }catch(err){
        res.status(400).json({ error: err.message });
  }
}



async function getAllProject(req, res) {
    try {
      // Étape 1 : Récupération initiale
      const projects = await Project.find({ archived: false }).select("title description category status startDate endDate type");
  
      if (!projects || projects.length === 0) {
        return res.status(404).json({ message: "No projects found" });
      }
  
      // Étape 2 : Mise à jour des statuts
      await Promise.all(projects.map(project => updateProjectStatus(project._id)));
  
      // Étape 3 : Re-fetch avec statuts mis à jour
      const updatedProjects = await Project.find({ archived: false }).select("title description category status startDate endDate type");
  
      // Étape 4 : Tri par date de fin la plus proche d’aujourd’hui
      const today = new Date();
  
      updatedProjects.sort((a, b) => {
        const dateA = new Date(a.endDate);
        const dateB = new Date(b.endDate);
  
        // On favorise les dates futures (proches de today), mais autorise les dates passées à la fin
        const diffA = dateA - today >= 0 ? dateA - today : Infinity;
        const diffB = dateB - today >= 0 ? dateB - today : Infinity;
  
        return diffA - diffB;
      });
  
      // Étape 5 : Réponse
      res.status(200).json(updatedProjects);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  

// 📌 Get Project by ID
async function getProjectByID(req,res){
    try{
        const project = await Project.findById(req.params.id)
        .populate("tasksID")
        .populate("usersID")
        .populate("ownerID")
        .populate("sprintsID");
        if (!project) return res.status(400).json({"message":"Project not found"});

        res.status(200).json(project);
    }catch(err){
        res.status(500).json({error: err.message });
        res.status(500).json({error: err.message });
    }
}

// 📌 Update Project
// 📌 Update Project
async function updateProject(req , res){
    try{
        const project = await Project.findByIdAndUpdate(req.params.id,req.body, {new: true});
        if (!project) return res.status(400).json({"message":"Project not found"});
            res.status(200).json({"message":"Project updated successfully", project:project});
    }catch(err){
        res.status(500).json({error: err.message });
    }
}

// 📌 Delete a project

async function deleteProjectAndTasks (req, res) {
    try {
      const {id: projectId } = req.params;
  
      // 1. delete all tasks associated with the project
      const deleteTasksResult = await Task.deleteMany({ projectId });
  
      // 2. delete project
      const project = await Project.findByIdAndDelete(projectId);
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      res.status(200).json({
        message: `${deleteTasksResult.deletedCount} task(s) and project deleted successfully`,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  
  }

async function assignUserToProject(req, res) {
    try {
        const { projectId, email, userType } = req.body;

        // 1. Récupérer l'utilisateur par son email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = user._id;
        const userIdStr = userId.toString();

        // 2. Trouver le projet
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        let updated = false;
        let messages = [];

        if (userType === 'Manager') {
            if (project.ownerID) {
                return res.status(400).json({ message: "Project already has an owner" });
            }
            project.ownerID = userId;
            project.usersID.push(userId);
            updated = true;
            messages.push("User assigned as project owner and member");
        } else if (userType === 'User') {
            const alreadyMember = project.usersID.some(id => id.toString() === userIdStr);
            if (!alreadyMember) {
                project.usersID.push(userId);
                updated = true;
                messages.push("User added as project member");
            } else {
                messages.push("User is already a project member");
            }
        } else {
            return res.status(400).json({ message: "Invalid userType" });
        }

        project.team = project.usersID.length + (project.ownerID ? 1 : 0);

        if (updated) {
            await project.save();
            return res.status(200).json({ message: messages.join(" & "), project });
        } else {
            return res.status(400).json({ message: messages.join(" & ") });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}





// 📌 Get Project By User
async function getProjectByUser(req,res){
    try{
        const project = await Project.find({usersID:req.params.id})
        res.status(200).json(project)
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

// 📌 Delete Member from project
async function removeMemberFromProject(req, res) {
    try {
        const { projectId, userId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        project.usersID = project.usersID.filter(member => member.toString() !== userId);
        await project.save();
        res.status(200).json({ message: "Member removed successfully", project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 📌 Archived Project
async function archiveProject(req, res) {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        project.archived = true;
        await project.save();
        res.status(200).json({ message: "Project archived successfully", project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 📌 Get All Project archived
async function getAllArchivedProject (req,res) {
    try{
    const project = await  Project.find({archived: true});
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project)
    } catch(err){
        res.status(500).json({error: err.message})
    }

}

// 📌 Restore Project
async function restoreProject(req, res) {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, { archived: false }, { new: true });

        if (!project) return res.status(404).json({ "message": "Project not found" });

        res.status(200).json({ "message": "Project restored", project });

    } catch (error) {
        res.status(500).json({ "error": error.message });
    }
}


// 📌 Update  status Project 

const updateProjectStatus = async (projectId) => {
  try {
    // Recherche du projet par son ID
    const project = await Project.findById(projectId);
    if (!project) {
      console.error("Project not found.");
      return { updated: false, message: "Project not found." };
    }

    // Récupération de toutes les tâches liées au projet
    const tasks = await Task.find({ projectId: projectId });

    // Dates importantes pour la logique
    const today = new Date();
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);

    // Initialisation par défaut du statut
    let newStatus = "Not Started";
    let message = "Default status applied: Not Started.";

    // Si le projet contient des tâches
    if (tasks.length > 0) {
      // Vérifie s'il existe au moins une tâche "In Progress"
      const hasInProgressTask = tasks.some(task => task.status === "In Progress");

      // Vérifie si toutes les tâches sont "Done"
      const allTasksCompleted = tasks.every(task => task.status === "Done");

      // Si au moins une tâche est "In Progress" mais que la date de début du projet n'est pas encore arrivée
      if (hasInProgressTask && today < startDate) {
        newStatus = "Not Started";
        message = "Project has In Progress tasks but has not reached start date.";
      }

      // Si une tâche est "In Progress" et que la date de début est aujourd'hui ou passée
      else if (hasInProgressTask && today >= startDate) {
        newStatus = "In Progress";
        message = "Project is now In Progress.";
      }

      // Si toutes les tâches sont terminées
      if (allTasksCompleted) {
        newStatus = "Done";
        message = "All tasks completed: Project marked as Done.";
      }
    }

    // Si le projet n'est ni "Done" ni "Canceled" et que la date de fin est dépassée
    if (newStatus !== "Done" && newStatus !== "Canceled" && today > endDate) {
      newStatus = "Overdue";
      message = "Project is overdue.";
    }

    // Si le statut a changé, on le met à jour en base de données
    if (project.status !== newStatus) {
      await Project.findByIdAndUpdate(projectId, { status: newStatus });
      console.log(`Project ${projectId} updated to ${newStatus}`);
      return { updated: true, message };
    } else {
      // Aucun changement nécessaire
      console.log(`Project ${projectId} status unchanged (${newStatus})`);
      return { updated: false, message: `Status unchanged: ${newStatus}` };
    }

  } catch (error) {
    // Gestion des erreurs éventuelles
    console.error("Error updating project status:", error);
    return { updated: false, message: "Error occurred while updating project status." };
  }
};


//delete project 
  async function deleteSomeTasksFromProject (req, res) {
    try {
      const {id: projectId } = req.params;
      const { taskIdsToDelete } = req.body;
  
      if (!Array.isArray(taskIdsToDelete) || taskIdsToDelete.length === 0) {
        return res.status(400).json({ message: "taskIdsToDelete must be a non-empty array" });
      }
  
      // delete tasks from task collection
      const deleteResult = await Task.deleteMany({ _id: { $in: taskIdsToDelete } });
  
      // delete tasks from project's tasks array
      await Project.findByIdAndUpdate(projectId, {
        $pull: { taskIds: { $in: taskIdsToDelete } }
      });
  
      // update project status
      await updateProjectStatus(projectId);
  
      res.status(200).json({
        message: `${deleteResult.deletedCount} task(s) deleted from project ${projectId}`,
        deletedTaskIds: taskIdsToDelete
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };



  //les methodes avancer 
  //calculer l'avancement de projet 
  async function getProjectProgress(req, res) {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const tasks = await Task.find({ projectId: req.params.id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'Done').length;
        const toDoTasks = tasks.filter(task => task.status === 'To Do').length;
        const inprogressTasks = tasks.filter(task => task.status === 'In Progress').length;

        const completed = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
        const toDo = totalTasks === 0 ? 0 : (toDoTasks / totalTasks) * 100;
        const inProgress = totalTasks === 0 ? 0 : (inprogressTasks / totalTasks) * 100;

        res.status(200).json({ completed: `${completed}%`,toDo:`${toDo}%`,inProgress:`${inProgress}%` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// verfier les projet qui sont en retard 
async function checkProjectOverdue(req, res) {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const currentDate = new Date();
        const endDate = new Date(project.endDate);

        if (currentDate > endDate && project.status == 'In Progress') {
            res.status(200).json({ message: "Project is overdue" ,project: project});
        } else {
            res.status(200).json({ message: "Project is not overdue" ,project: project});
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


//search by title status category start and end date
async function searchProjects(req, res) {
    try {
        const { status, category,title, startDate, endDate } = req.body;
        const query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (title) query.title = title;
        if (startDate) query.startDate = { $gte: new Date(startDate) };
        if (endDate) query.endDate = { $lte: new Date(endDate) };

        const projects = await Project.find(query);
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function getProjectTaskSummary(req, res) {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const tasks = await Task.find({ projectId: req.params.id });

        const taskSummary = tasks.reduce((acc, task) => {
            if (!acc[task.status]) acc[task.status] = 0;
            acc[task.status]++;
            return acc;
        }, {});

        res.status(200).json({ taskSummary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}




//partie mailling 


//search by title status category start and end date
async function searchProjects(req, res) {
    try {
        const { status, category,title, startDate, endDate } = req.body;
        const query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (title) query.title = title;
        if (startDate) query.startDate = { $gte: new Date(startDate) };
        if (endDate) query.endDate = { $lte: new Date(endDate) };

        const projects = await Project.find(query);
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function getProjectTaskSummary(req, res) {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const tasks = await Task.find({ projectId: req.params.id });

        const taskSummary = tasks.reduce((acc, task) => {
            if (!acc[task.status]) acc[task.status] = 0;
            acc[task.status]++;
            return acc;
        }, {});

        res.status(200).json({ taskSummary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

  

module.exports={createProject,getAllProject,getProjectByID,updateProject,assignUserToProject,getProjectByUser,removeMemberFromProject,archiveProject,getAllArchivedProject,restoreProject,updateProjectStatus,deleteProjectAndTasks,deleteSomeTasksFromProject,getProjectProgress,checkProjectOverdue,getProjectTaskSummary,searchProjects};