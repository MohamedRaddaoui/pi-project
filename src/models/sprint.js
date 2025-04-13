const mongoose = require('mongoose')
 

const  Schema = mongoose.Schema;
const Sprint  = new Schema({

    title:{
        type:String,
        required:true

    },
    goal:{
        type:String,

    },
    start_date:{
        type:Date,
        required:true
    },
    end_date:{
        type:Date,
        required:true
        },
    status:{
        type:String,
        enum:['Planned','In Progress','Completed'],
        default:'Planned'

    },
    projectID:{
        type:mongoose.Types.ObjectId,
        ref: 'Project',

    },
    participants: [{
        type: String,   // Références à des utilisateurs (user_001, user_002, etc.)
        required: true
      }],


      backlog: [{
        type: String,   // Références à des tâches (task_101, task_102, etc.)
        required: true
      }],


      planning: [{
        planningId: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ['Sprint Planning', 'Daily Scrum', 'Sprint Review'],
          required: true
        },
        date: {
          type: Date,
          required: true
        }
      }],
      review: {
        reviewDate: {
          type: Date,
          required: true
        },
        feedback: {
          type: String,
          required: true
        }
      },
      retrospective: {
        retrospectiveDate: {
          type: Date,
          required: true
        },
        whatWentWell: [{
          type: String
        }],
        whatCouldBeImproved: [{
          type: String
        }]
      }
    }, {
      timestamps: true


})