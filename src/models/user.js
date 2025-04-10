const mongo=require("mongoose");
const Schema=mongo.Schema;

const User=new Schema({   
    firstname:String,
    lastname:String,
    email:String,
    password:String, //pour le hashage
    role:String,
    createdAt: { type: Date, default: Date.now },
    twoFASecret: String, // Clé secrète pour 2FA
    isTwoFAEnabled: { type: Boolean, default: false } // Indique si 2FA est activé      
         
});  

module.exports=mongo.model("user", User);