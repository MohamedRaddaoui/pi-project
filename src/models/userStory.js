const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserStory = new Schema({
  title: { 
    type: String, 
    required: true 
    },
  description: String,
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Done'], 
    default: 'To Do' 
    },
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    default: 'Medium' 
  },
  storyPoints: Number,
  sprintID: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Sprint'
     },
     assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Utilisateur auquel la tâche est assignée
    },
    backlogID:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'productBacklog'
    }
}, { timestamps: true });

module.exports = mongoose.model('userStory', UserStory);
