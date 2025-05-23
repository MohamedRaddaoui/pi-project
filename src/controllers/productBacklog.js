const ProductBacklog = require('../models/productBacklog')
const userStory = require('../models/userStory');

// Ajouter un nouveau ProductBacklog
async function createProductBacklog(req, res) {
    try {
        // Créer un nouveau backlog avec l’ID du projet associé
        const newProductBacklog = new ProductBacklog({
            title:req.body.title,
            description:req.body.description,
            projectID: req.params.id
        });

        await newProductBacklog.save();

        res.status(201).json({ message: 'Product Backlog created successfully!', newProductBacklog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating Product Backlog' });
    }
}


// Récupérer tous les ProductBacklogs
async function getAllProductBacklogs (req, res){
    try {
        const productBacklogs = await ProductBacklog.find().populate('projectID').populate('userStoriesId');
        res.status(200).json(productBacklogs);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving Product Backlogs' });
    }
};

// Récupérer un ProductBacklog spécifique
async function getProductBacklogById(req, res){
    try {
        const productBacklog = await ProductBacklog.findById(req.params.id).populate('projectID.title').populate('userStoriesId.title');
        if (!productBacklog) {
            return res.status(404).json({ message: 'Product Backlog not found' });
        }
        res.status(200).json(productBacklog);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving Product Backlog' });
    }
};


// Mettre à jour un ProductBacklog
async function updateProductBacklog (req, res){
    
    try {
        const updatedProductBacklog = await ProductBacklog.findByIdAndUpdate(req.params.id,req.body,{ new: true });
        if (!updatedProductBacklog) {
            return res.status(404).json({ message: 'Product Backlog not found' });
        }
        res.status(200).json({ message: 'Product Backlog updated successfully!', updatedProductBacklog });
    } catch (error) {
        res.status(500).json({ error: 'Error updating Product Backlog' });
    }
};



// Supprimer un ProductBacklog
async function deleteProductBacklog (req, res) {
    const { id } = req.params;
    try {
        const deletedUserStory = await userStory.deleteMany(id)
        const deletedProductBacklog = await ProductBacklog.findByIdAndDelete(id);
        if (!deletedProductBacklog) {
            return res.status(404).json({ message: 'Product Backlog not found' });
        }
        res.status(200).json({ message:`${deletedUserStory.deletedCount} UserStory and Product Backlog deleted successfully!`});
    } catch (error) {
        res.status(500).json({ error: 'Error deleting Product Backlog' });
    }
};



// Filtrer les ProductBacklogs par projet
async function getProductBacklogsByProject(req, res){
    const { id} = req.params;
    try {
        const productBacklogs = await ProductBacklog.find({ projectID: id })
                                                    .populate('userStoriesId');
        res.status(200).json(productBacklogs);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving Product Backlogs for the project' });
    }
};

module.exports={createProductBacklog,getAllProductBacklogs,getProductBacklogById,updateProductBacklog,deleteProductBacklog,getProductBacklogsByProject}

