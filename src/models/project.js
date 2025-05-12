
const mongoose=require("mongoose");

const Schema= mongoose.Schema;
const Project=new Schema({
    title:{
        type:String,
        minlength: 3,
        trim: true,
        required:true,  
        },

    description:{
        type:String,
        minlength: 30,
        trim:true,
        required:true,
    },
    startDate:{
        type:Date,
        required:true,
        },
    endDate:{
        type:Date,
        required:true,
    },
    ownerID:{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    team:{
        type: Number,
        default: 0,
    },
    status:{
        type: String,
        trim: true,
        enum: ['Not Started','In Progress', 'Done', 'Canceled','Overdue'],
        default: 'Not Started',
    },
    category:{
        type:String,
        required: true,
        default:'dev'
    },
    usersID:[{
        type: mongoose.Schema.ObjectId, 
        ref : "User", 
    }],
    archived:{
        type:Boolean,
        default:false
    },
    summarySent: 
    { type: Boolean, 
    default: false },

    type:{
        type:String,
        trim: true,
        enum: ['Kanban','Scrum'],
        default:'Kanban'
    }


})

// 📌 Add a virtual field to retrieve the associated tasks
Project.virtual("tasksID", {
    ref: "Task",
    localField: "_id",
    foreignField: "projectId",
  });

  // 📌 Activation des champs virtuels pour les JSON
  Project.set("toJSON", { virtuals: true });
  Project.set("toObject", { virtuals: true });
module.exports=mongoose.model('project', Project)