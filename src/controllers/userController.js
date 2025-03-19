const User=require("../models/user");

async function adduser (req,res){
  try{
      
      const user =new User(req.body);
      await user.save();
      res.status(200).json(user);   //.send("good added")

  }catch(err){
      res.status(400).json({ error: err.message });
  }
}

async function showuser(req,res){
  try{
      
      const user =await User.find();
      res.status(200).json(user);   

  }catch(err){
      res.status(400).json({ error: err.message });
  }
}

async function deleteuser (req,res){
  try{
      
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("deleted succefully");   

  }catch(err){
      res.status(400).json({ error: err.message });
  }
}

async function updateuser(req,res){
  try{
      
      const user =await User.findByIdAndUpdate(req.params.id,req.body,{new:true});
      res.status(200).json(user);   //.send("good added")

  }catch(err){
      res.status(400).json({ error: err.message });
  }
}


module.exports = {adduser, showuser, deleteuser, updateuser };