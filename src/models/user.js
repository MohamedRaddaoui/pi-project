const mongo=require("mongoose");
const Schema=mongo.Schema;

const User=new Schema({   
    firstname:String,
    lastname:String,
    email:String,
    password:Number,
    role:Number,
    createdAt:Date      
         
});  

module.exports=mongo.model("user", User);