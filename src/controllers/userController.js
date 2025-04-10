const User=require("../models/user");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");

async function adduser(req, res) {
  try {
    // Hasher le mot de passe avant d’enregistrer l’utilisateur
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = new User(req.body);
    await user.save();
    res.status(200).json(user);

  } catch (err) {
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

 // Fonction de login incluant la vérification 2FA
async function login(req, res) {
  const { email, password, token } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ error: "Utilisateur non trouvé" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ error: "Mot de passe incorrect" });
      }

      // Vérifier 2FA si activé
      if (user.isTwoFAEnabled) {
          if (!token) {
              return res.status(400).json({ error: "Code 2FA requis" });
          }

          const verified = speakeasy.totp.verify({
              secret: user.twoFASecret,
              encoding: "base32",
              token: token
          });

          if (!verified) {
              return res.status(400).json({ error: "Code 2FA invalide" });
          }
      }

      res.json({ message: "Connexion réussie" });
  } catch (err) {
      res.status(500).json({ error: "Erreur serveur" });
  }
};


module.exports = {adduser, showuser, deleteuser, updateuser, login };