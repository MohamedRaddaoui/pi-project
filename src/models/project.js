const mongo=require('mongoose')
const Schema= mongo.Schema
const Project=new Schema({
    name:String,
    description:String,
    startDate:Date,
    endDate:Date,
    ownerID:String,
    team:Number,
    status:String,
    category:String,
    users:[],
    tasks:[]


})
module.exports=mongo.model('project', Project)