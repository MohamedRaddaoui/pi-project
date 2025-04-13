const Project = require("../models/project");
const Task = require("../models/task");
const User = require("../models/user");


// 📌 Create new Project
async function createProject(req, res){
    try{
        
        const project = new Project (req.body);
        await project.save();
         res.status(201).json({message:"Project created successfully", project:project});
         
    }catch(err){
        res.status(400).json({ error: err.message });
  }
}

// 📌 Get all Projects
async function getAllProject(req,res){
    try {
        const project = await Project.find({archived:false}).select("title descriptio category status startDate endDate");
        res.status(200).json(project);
    }catch (err){
        res.status(500).json({error: err.message });
    }

}

// 📌 Get Project by ID
async function getProjectByID(req,res){
    try{
        const project = await Project.findById(req.params.id)
        .populate("tasksID")
        .populate("usersID")
        .populate("ownerID");
        if (!project) return res.status(400).json({"message":"Project not found"});
        res.status(200).json(project);
    }catch(err){
        res.status(500).json({error: err.message });
    }
}

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

// 📌 Assign Member to Project
// async function assignUserToProject(req, res) {
//     try {
//         const { projectId, userId } = req.body;
//         const project = await Project.findById(projectId);
//         if (!project) return res.status(404).json({ message: "Project not found" });

//         if (!project.usersID.includes(userId)) {
//             project.usersID.push(userId);
//             project.team=+1;
//             await project.save();
//             return res.status(200).json({ message: "Member added successfully", project });
//         }

//         res.status(400).json({ message: "Member already in the project" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }


async function assignUserToProject(req, res) {
    try {
        const { projectId, userId, userType } = req.body;

        // Étape 1 : Trouver le projet dans la base de données
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const userIdStr = userId.toString(); // Convertir l'ID utilisateur en chaîne de caractères pour la comparaison.

        let updated = false;
        let messages = [];

        // Étape 2 : Vérifier quel type d'utilisateur l'utilisateur doit avoir

        // Si le userType est "admin", affecter comme propriétaire
        if (userType === 'Manager') {
            if (project.ownerID) {
                // Si un propriétaire existe déjà, retourner un message d'erreur
                return res.status(400).json({ message: "Project already has an owner" });
            }
            // Affecter l'utilisateur comme propriétaire et comme membre
            project.ownerID = userId;
            project.usersID.push(userId);  // Ajouter également l'utilisateur dans la liste des membres
            updated = true;
            messages.push("User assigned as project owner and member");
        }

        // Si le userType est "member", ajouter l'utilisateur comme membre
        else if (userType === 'User') {
            const alreadyMember = project.usersID.some(id => id.toString() === userIdStr);
            if (!alreadyMember) {
                project.usersID.push(userId);  // Ajouter comme membre
                updated = true;
                messages.push("User added as project member");
            } else {
                messages.push("User is already a project member");
            }
        } else {
            return res.status(400).json({ message: "Invalid userType" });
        }

        // Étape 3 : Mettre à jour la taille de l'équipe
        project.team = project.usersID.length + (project.ownerID ? 1 : 0);  // Nombre total = membres + 1 si le propriétaire existe

        // Sauvegarder les modifications
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
      // get all tasks assigned to project 
      const tasks = await Task.find({ projectId: projectId })

    let newStatus = "Not Started"; // dafault status

    if (tasks.length > 0) {
        const hasInProgressTask = tasks.some((task) => task.status === "In Progress");
        const allTasksCompleted = tasks.every((task) => task.status === "Done");

        if (hasInProgressTask) newStatus = "In Progress";
        if (allTasksCompleted) newStatus = "Done";
    }

    // update project status
    await Project.findByIdAndUpdate(projectId, { status: newStatus });

    console.log(` Project ${projectId} updated to ${newStatus}`);
} catch (error) {
    console.error(" Error updating project status:", error);
}
  };
  
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

        if (currentDate > endDate) {
            res.status(200).json({ message: "Project is overdue" });
        } else {
            res.status(200).json({ message: "Project is not overdue" });
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

  

module.exports={createProject,getAllProject,getProjectByID,updateProject,assignUserToProject,getProjectByUser,removeMemberFromProject,archiveProject,getAllArchivedProject,restoreProject,updateProjectStatus,deleteProjectAndTasks,deleteSomeTasksFromProject,getProjectProgress,checkProjectOverdue,getProjectTaskSummary,searchProjects};