// sprint.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Sprint = new Schema({
  title: {
     type: String,
      required: true
     },
  goal: String,
  start_date: { 
    type: Date, 
    required: true 
    },
  end_date: { 
    type: Date, 
    required: true
    },
  status: { 
    type: String, 
    enum: ['Planned', 'In Progress', 'Completed'],
    default: 'Planned' 
    },
  projectID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'project' },

  userStories: [{
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'userStory'
     }], // user stories sélectionnées
  planning: [{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Event'
     }], // pour daily meetings

     reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ], // Références aux événements de revue de sprint
  
    retrospectives: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],  // Références aux événements de revue de sprint

}, { timestamps: true });

module.exports = mongoose.model('sprint', Sprint);
