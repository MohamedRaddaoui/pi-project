
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
        //type: mongoose.Schema.ObjectId,
        //ref: User
    },
    team:{
        type: Number,
        default: 0,
    },
    status:{
        type: String,
        trim: true,
        enum: ["Not Started","In Progress", "Done", "Canceled"],
        default: "Not Started",

    },
    category:{
        type:String,
        required: true
    },
    usersID:[{
        type:Array,
        user: mongoose.Schema.ObjectId, 
        ref : "User", 
    }],
    tasksID:[{
        type:Array,
          task: mongoose.Schema.ObjectId,
          ref : "Tasks",
    }]


});
module.exports=mongoose.model("Project", Project);
