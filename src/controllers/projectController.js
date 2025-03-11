const Project = require('../models/project')



// Create new Project
async function addProject(req, res){
    try{
        const project = new Project (req.body)
        await project.save()
         res.status(200).json({message:"Event created successfully", project:project})
         
    }catch(err){
        res.status(400).json({ error: err.message });
  }
}
//Get all Projects
async function getAllProject(req,res){
    try {
        const project = await Project.find()
        res.status(200).json(project)
    }catch (err){
        res.status(500).json({error: err.message })
    }

}

// Get Project by ID
async function getProjectByID(req,res){
    try{
        const project = await Project.findById(req.params.id)
        if (!project) return res.status(400).json({"message":"Project not found"})
        res.status(200).json(project)
    }catch(err){
        res.status(500).json({error: err.message })
    }
}

//Delete a project
async function deleteProject(req,res){
    try{
        const project = await Project.findByIdAndDelete(req.params.id)
        console.log(project)
        if (!project) return res.status(404).json({"message":"Project not found"});
        res.status(200).json({"message":"Project deleted successfully"})
    }catch (err){
        res.status(500).json({error: err.message })

    }

}



module.exports={addProject,getAllProject,getProjectByID,deleteProject}