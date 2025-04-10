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
        .populate("usersID");
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
  
      // 1. Supprimer les tâches associées au projet
      const deleteTasksResult = await Task.deleteMany({ projectId });
  
      // 2. Supprimer le projet
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
async function assignUserToProject(req, res) {
    try {
        const { projectId, userId } = req.body;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (!project.usersID.includes(userId)) {
            project.usersID.push(userId);
            project.team=+1;
            await project.save();
            return res.status(200).json({ message: "Member added successfully", project });
        }

        res.status(400).json({ message: "Member already in the project" });
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

    console.log(`✅ Project ${projectId} updated to ${newStatus}`);
} catch (error) {
    console.error("❌ Error updating project status:", error);
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
  



  





module.exports={createProject,getAllProject,getProjectByID,updateProject,assignUserToProject,getProjectByUser,removeMemberFromProject,archiveProject,getAllArchivedProject,restoreProject,updateProjectStatus,deleteProjectAndTasks,deleteSomeTasksFromProject};