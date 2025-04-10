
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
        minlength: 200,
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
        ref: "user"
    },
    team:{
        type: Number,
        default: 0,
    },
    status:{
        type: String,
        trim: true,
        enum: ['Not Started','In Progress', 'Done', 'Canceled'],
        default: 'Not Started',
    },
    category:{
        type:String,
        required: true
    },
    usersID:[{
        type: mongoose.Schema.ObjectId, 
        ref : "user", 
    }],
    tasksID:[{
        type:Array,
          task: mongoose.Schema.ObjectId,
          ref : "Tasks",
    }],

    archived:{
        type:Boolean,
        default:false
    }


})
module.exports=mongoose.model('project', Project)