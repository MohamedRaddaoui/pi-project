const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const ProductBacklog = new Schema({
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
    },
    projectID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'project'
    },
  userStoriesId:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'userStory'
  }]

},
{ timestamps: true });

module.exports=mongoose.model('productBacklog',ProductBacklog) 